-- PierdePaga — dominio de juego (scopes, partidos, ranking)
-- Aplicar después de schema.sql

-- ---------------------------------------------------------------------------
-- Scopes de competencia (país + provincia + deporte)
-- ---------------------------------------------------------------------------

create table if not exists public.ranking_scopes (
  id uuid primary key default gen_random_uuid(),
  country_id text not null,
  province text not null,
  sport_id text not null,
  created_at timestamptz not null default now(),
  unique (country_id, province, sport_id)
);

create index if not exists ranking_scopes_lookup_idx
  on public.ranking_scopes (country_id, province, sport_id);

-- ---------------------------------------------------------------------------
-- Stats y ranking por jugador en un scope
-- ---------------------------------------------------------------------------

create table if not exists public.player_rankings (
  scope_id uuid not null references public.ranking_scopes (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  skill_rating numeric(8, 2) not null default 1200,
  matches_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  streak integer not null default 0,
  best_positive_streak integer not null default 0,
  composite_score numeric(10, 6) not null default 0,
  rank_position integer,
  rank_delta integer not null default 0,
  first_match_at timestamptz,
  last_match_at timestamptz,
  ranked_at timestamptz,
  primary key (scope_id, player_id)
);

create index if not exists player_rankings_scope_rank_idx
  on public.player_rankings (scope_id, composite_score desc, matches_played desc);

-- ---------------------------------------------------------------------------
-- Snapshots para rank_delta y podio anual
-- ---------------------------------------------------------------------------

create table if not exists public.ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  scope_id uuid not null references public.ranking_scopes (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  rank_position integer not null,
  composite_score numeric(10, 6) not null,
  skill_rating numeric(8, 2) not null,
  season_year integer,
  snapshot_at timestamptz not null default now()
);

create index if not exists ranking_snapshots_scope_player_idx
  on public.ranking_snapshots (scope_id, player_id, snapshot_at desc);

-- ---------------------------------------------------------------------------
-- Clubes (determinan provincia del partido)
-- ---------------------------------------------------------------------------

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_id text not null,
  province text not null,
  created_by uuid references public.profiles (id) on delete set null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists clubs_province_idx
  on public.clubs (country_id, province, lower(name));

-- ---------------------------------------------------------------------------
-- Partidos
-- ---------------------------------------------------------------------------

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  scope_id uuid not null references public.ranking_scopes (id),
  match_type text not null
    check (match_type in ('simple', 'pierde_paga')),
  status text not null default 'pending_confirmation'
    check (status in ('pending_confirmation', 'confirmed', 'cancelled')),
  club_id uuid references public.clubs (id) on delete set null,
  club_name text not null,
  stake_amount numeric(12, 2),
  played_at timestamptz not null,
  scheduled_at timestamptz,
  score text not null,
  winner_team text not null check (winner_team in ('A', 'B')),
  loaded_by_id uuid not null references public.profiles (id),
  challenge_id uuid,
  admin_resolved boolean not null default false,
  team_a_skill_avg numeric(8, 2),
  team_b_skill_avg numeric(8, 2),
  skill_stake_if_a_wins numeric(8, 2),
  skill_stake_if_b_wins numeric(8, 2),
  skill_loss_if_a_wins numeric(8, 2),
  skill_loss_if_b_wins numeric(8, 2),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists matches_scope_played_idx
  on public.matches (scope_id, played_at desc);

create index if not exists matches_status_idx
  on public.matches (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Participantes (4 jugadores, confirmaciones)
-- ---------------------------------------------------------------------------

create table if not exists public.match_participants (
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.profiles (id),
  team text not null check (team in ('A', 'B')),
  slot smallint not null check (slot in (1, 2)),
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  skill_before numeric(8, 2),
  skill_after numeric(8, 2),
  skill_delta numeric(8, 2),
  primary key (match_id, player_id),
  unique (match_id, team, slot)
);

create index if not exists match_participants_player_idx
  on public.match_participants (player_id, match_id);

-- Premios por scope (migración sobre tabla existente)
alter table public.sponsor_prize_submissions
  add column if not exists scope_id uuid references public.ranking_scopes (id);

alter table public.matches add column if not exists team_a_skill_avg numeric(8, 2);
alter table public.matches add column if not exists team_b_skill_avg numeric(8, 2);
alter table public.matches add column if not exists skill_stake_if_a_wins numeric(8, 2);
alter table public.matches add column if not exists skill_stake_if_b_wins numeric(8, 2);
alter table public.matches add column if not exists skill_loss_if_a_wins numeric(8, 2);
alter table public.matches add column if not exists skill_loss_if_b_wins numeric(8, 2);

-- ---------------------------------------------------------------------------
-- Helpers: scope, Elo, composite, rerank
-- ---------------------------------------------------------------------------

create or replace function public.get_or_create_ranking_scope(
  p_country_id text,
  p_province text,
  p_sport_id text
)
returns uuid
language plpgsql
as $$
declare
  v_scope_id uuid;
begin
  select id into v_scope_id
  from public.ranking_scopes
  where country_id = p_country_id
    and province = p_province
    and sport_id = p_sport_id;

  if v_scope_id is null then
    insert into public.ranking_scopes (country_id, province, sport_id)
    values (p_country_id, p_province, p_sport_id)
    returning id into v_scope_id;
  end if;

  return v_scope_id;
end;
$$;

create or replace function public.elo_expected(ra numeric, rb numeric)
returns numeric
language sql
immutable
as $$
  select 1.0 / (1.0 + power(10.0, (rb - ra) / 400.0));
$$;

create or replace function public.compute_match_transfer(
  p_winner_avg numeric,
  p_loser_avg numeric
)
returns numeric
language plpgsql
immutable
as $$
declare
  v_e numeric;
  v_k constant numeric := 32;
  v_transfer numeric;
begin
  v_e := public.elo_expected(p_winner_avg, p_loser_avg);
  v_transfer := v_k * (1.0 - v_e);
  v_transfer := least(60, greatest(2, v_transfer));
  return round(v_transfer, 2);
end;
$$;

create or replace function public.apply_loser_transfer(
  p_player_skill numeric,
  p_nominal_transfer numeric
)
returns numeric
language sql
immutable
as $$
  select least(
    p_nominal_transfer,
    greatest(p_player_skill - 800, 0)
  );
$$;

create or replace function public.elo_skill_delta(
  p_team_avg numeric,
  p_opp_avg numeric,
  p_won boolean,
  p_player_skill numeric
)
returns numeric
language plpgsql
immutable
as $$
declare
  v_e numeric;
  v_k constant numeric := 32;
  v_delta numeric;
begin
  v_e := public.elo_expected(p_team_avg, p_opp_avg);

  if p_won then
    v_delta := v_k * (1.0 - v_e);
    v_delta := least(60, greatest(2, v_delta));
  else
    v_delta := v_k * (0.0 - v_e);
    if p_player_skill <= 800 then
      v_delta := greatest(v_delta, -2);
    else
      v_delta := greatest(v_delta, -60);
    end if;
  end if;

  return round(v_delta, 2);
end;
$$;

create or replace function public.compute_composite_score(
  p_matches_played integer,
  p_wins integer,
  p_skill_rating numeric,
  p_streak integer
)
returns numeric
language plpgsql
immutable
as $$
declare
  v_norm_vol numeric;
  v_norm_wr numeric;
  v_norm_skill numeric;
  v_norm_streak numeric;
begin
  v_norm_vol := least(p_matches_played / 30.0, 1.0);
  v_norm_wr := (p_wins + 5.0) / (p_matches_played + 10.0);
  v_norm_skill := greatest(0, least(1, (p_skill_rating - 800) / 2000.0));
  v_norm_streak := least(greatest(p_streak, 0) / 20.0, 1.0);

  return round(
    0.35 * v_norm_vol
    + 0.30 * v_norm_wr
    + 0.25 * v_norm_skill
    + 0.10 * v_norm_streak,
    6
  );
end;
$$;

create or replace function public.ensure_player_ranking(
  p_scope_id uuid,
  p_player_id uuid
)
returns public.player_rankings
language plpgsql
as $$
declare
  v_row public.player_rankings;
begin
  insert into public.player_rankings (scope_id, player_id)
  values (p_scope_id, p_player_id)
  on conflict (scope_id, player_id) do nothing;

  select * into v_row
  from public.player_rankings
  where scope_id = p_scope_id and player_id = p_player_id;

  return v_row;
end;
$$;

create or replace function public.update_streak(
  p_current integer,
  p_won boolean
)
returns integer
language plpgsql
immutable
as $$
begin
  if p_won then
    if p_current >= 0 then
      return p_current + 1;
    end if;
    return 1;
  end if;

  if p_current <= 0 then
    return p_current - 1;
  end if;
  return -1;
end;
$$;

create or replace function public.rerank_scope(p_scope_id uuid)
returns void
language plpgsql
as $$
begin
  with ranked as (
    select
      player_id,
      row_number() over (
        order by composite_score desc, matches_played desc, skill_rating desc
      )::integer as new_rank
    from public.player_rankings
    where scope_id = p_scope_id
      and matches_played > 0
  )
  update public.player_rankings pr
  set
    rank_delta = coalesce(pr.rank_position, ranked.new_rank) - ranked.new_rank,
    rank_position = ranked.new_rank,
    ranked_at = now()
  from ranked
  where pr.scope_id = p_scope_id
    and pr.player_id = ranked.player_id;

  update public.player_rankings
  set rank_position = null, rank_delta = 0, ranked_at = now()
  where scope_id = p_scope_id
    and matches_played = 0;
end;
$$;

create or replace function public.finalize_confirmed_match(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
  v_scope_id uuid;
  v_team_a_avg numeric;
  v_team_b_avg numeric;
  v_winner_team text;
  v_winner_avg numeric;
  v_loser_avg numeric;
  v_transfer numeric;
  rec record;
  v_skill numeric;
  v_delta numeric;
  v_won boolean;
  v_new_skill numeric;
  v_new_streak integer;
  v_new_wins integer;
  v_new_losses integer;
  v_new_matches integer;
  v_composite numeric;
begin
  select * into v_match
  from public.matches
  where id = p_match_id
  for update;

  if v_match.id is null then
    raise exception 'Partido no encontrado';
  end if;

  if v_match.status <> 'pending_confirmation' then
    return;
  end if;

  if (
    select count(*)::integer
    from public.match_participants
    where match_id = p_match_id and confirmed = true
  ) < 3 then
    raise exception 'Se requieren al menos 3 confirmaciones';
  end if;

  v_scope_id := v_match.scope_id;
  v_winner_team := v_match.winner_team;

  -- Asegurar filas de ranking para los 4 jugadores
  for rec in
    select player_id from public.match_participants where match_id = p_match_id
  loop
    perform public.ensure_player_ranking(v_scope_id, rec.player_id);
  end loop;

  select avg(coalesce(mp.skill_before, pr.skill_rating)) into v_team_a_avg
  from public.match_participants mp
  join public.player_rankings pr
    on pr.scope_id = v_scope_id and pr.player_id = mp.player_id
  where mp.match_id = p_match_id and mp.team = 'A';

  select avg(coalesce(mp.skill_before, pr.skill_rating)) into v_team_b_avg
  from public.match_participants mp
  join public.player_rankings pr
    on pr.scope_id = v_scope_id and pr.player_id = mp.player_id
  where mp.match_id = p_match_id and mp.team = 'B';

  if v_winner_team = 'A' then
    v_winner_avg := v_team_a_avg;
    v_loser_avg := v_team_b_avg;
  else
    v_winner_avg := v_team_b_avg;
    v_loser_avg := v_team_a_avg;
  end if;

  v_transfer := public.compute_match_transfer(v_winner_avg, v_loser_avg);

  for rec in
    select
      mp.player_id,
      mp.team,
      coalesce(mp.skill_before, pr.skill_rating) as skill_rating,
      pr.streak,
      pr.wins,
      pr.losses,
      pr.matches_played,
      pr.best_positive_streak
    from public.match_participants mp
    join public.player_rankings pr
      on pr.scope_id = v_scope_id and pr.player_id = mp.player_id
    where mp.match_id = p_match_id
  loop
    v_skill := rec.skill_rating;
    v_won := rec.team = v_winner_team;

    if v_won then
      v_delta := v_transfer;
    else
      v_delta := -public.apply_loser_transfer(v_skill, v_transfer);
    end if;

    v_new_skill := greatest(800, round(v_skill + v_delta, 2));
    v_delta := v_new_skill - v_skill;

    v_new_streak := public.update_streak(rec.streak, v_won);
    v_new_matches := rec.matches_played + 1;

    if v_won then
      v_new_wins := rec.wins + 1;
      v_new_losses := rec.losses;
    else
      v_new_wins := rec.wins;
      v_new_losses := rec.losses + 1;
    end if;

    v_composite := public.compute_composite_score(
      v_new_matches, v_new_wins, v_new_skill, v_new_streak
    );

    update public.player_rankings
    set
      skill_rating = v_new_skill,
      matches_played = v_new_matches,
      wins = v_new_wins,
      losses = v_new_losses,
      streak = v_new_streak,
      best_positive_streak = greatest(rec.best_positive_streak, greatest(v_new_streak, 0)),
      composite_score = v_composite,
      first_match_at = coalesce(first_match_at, v_match.played_at),
      last_match_at = v_match.played_at
    where scope_id = v_scope_id and player_id = rec.player_id;

    update public.match_participants
    set
      skill_before = v_skill,
      skill_after = v_new_skill,
      skill_delta = v_delta
    where match_id = p_match_id and player_id = rec.player_id;
  end loop;

  update public.matches
  set
    status = 'confirmed',
    confirmed_at = now(),
    updated_at = now()
  where id = p_match_id;

  perform public.rerank_scope(v_scope_id);
end;
$$;

create or replace function public.confirm_match_participant(
  p_match_id uuid,
  p_player_id uuid
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches;
  v_confirmed_count integer;
begin
  update public.match_participants
  set confirmed = true, confirmed_at = now()
  where match_id = p_match_id
    and player_id = p_player_id
    and confirmed = false;

  if not found then
    raise exception 'No sos participante de este partido o ya confirmaste';
  end if;

  select count(*)::integer into v_confirmed_count
  from public.match_participants
  where match_id = p_match_id and confirmed = true;

  if v_confirmed_count >= 3 then
    perform public.finalize_confirmed_match(p_match_id);
  end if;

  select * into v_match from public.matches where id = p_match_id;
  return v_match;
end;
$$;

-- Perfiles visibles en ranking (nombre, avatar)
drop policy if exists "profiles_select_for_ranking" on public.profiles;
create policy "profiles_select_for_ranking"
  on public.profiles for select
  to authenticated
  using (account_type = 'jugador');

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.ranking_scopes enable row level security;
alter table public.player_rankings enable row level security;
alter table public.ranking_snapshots enable row level security;
alter table public.clubs enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;

drop policy if exists "ranking_scopes_select_authenticated" on public.ranking_scopes;
create policy "ranking_scopes_select_authenticated"
  on public.ranking_scopes for select
  to authenticated
  using (true);

drop policy if exists "player_rankings_select_authenticated" on public.player_rankings;
create policy "player_rankings_select_authenticated"
  on public.player_rankings for select
  to authenticated
  using (true);

drop policy if exists "ranking_snapshots_select_authenticated" on public.ranking_snapshots;
create policy "ranking_snapshots_select_authenticated"
  on public.ranking_snapshots for select
  to authenticated
  using (true);

drop policy if exists "clubs_select_authenticated" on public.clubs;
create policy "clubs_select_authenticated"
  on public.clubs for select
  to authenticated
  using (true);

drop policy if exists "clubs_insert_authenticated" on public.clubs;
create policy "clubs_insert_authenticated"
  on public.clubs for insert
  to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "matches_select_participant" on public.matches;
create policy "matches_select_participant"
  on public.matches for select
  to authenticated
  using (
    exists (
      select 1 from public.match_participants mp
      where mp.match_id = id and mp.player_id = auth.uid()
    )
    or loaded_by_id = auth.uid()
    or status = 'confirmed'
  );

drop policy if exists "matches_insert_loader" on public.matches;
create policy "matches_insert_loader"
  on public.matches for insert
  to authenticated
  with check (auth.uid() = loaded_by_id);

drop policy if exists "matches_update_loader" on public.matches;
create policy "matches_update_loader"
  on public.matches for update
  to authenticated
  using (
    auth.uid() = loaded_by_id
    and status = 'pending_confirmation'
  )
  with check (auth.uid() = loaded_by_id);

drop policy if exists "match_participants_insert_loader" on public.match_participants;
create policy "match_participants_insert_loader"
  on public.match_participants for insert
  to authenticated
  with check (
    exists (
      select 1 from public.matches m
      where m.id = match_id and m.loaded_by_id = auth.uid()
    )
  );

drop policy if exists "match_participants_select" on public.match_participants;
create policy "match_participants_select"
  on public.match_participants for select
  to authenticated
  using (
    exists (
      select 1 from public.match_participants mp2
      where mp2.match_id = match_id
        and mp2.player_id = auth.uid()
    )
    or exists (
      select 1 from public.matches m
      where m.id = match_id and m.status = 'confirmed'
    )
  );

drop policy if exists "match_participants_update_own_confirm" on public.match_participants;
create policy "match_participants_update_own_confirm"
  on public.match_participants for update
  to authenticated
  using (player_id = auth.uid())
  with check (player_id = auth.uid());

-- Scopes iniciales para sandbox
insert into public.ranking_scopes (country_id, province, sport_id)
values
  ('ar', 'Prueba', 'padel'),
  ('ar', 'Formosa', 'padel'),
  ('ar', 'Resistencia', 'padel'),
  ('ar', 'Corrientes', 'padel')
on conflict (country_id, province, sport_id) do nothing;

-- Permisos para cliente autenticado
grant select on public.ranking_scopes to authenticated;
grant select on public.player_rankings to authenticated;
grant select on public.ranking_snapshots to authenticated;
grant select, insert on public.clubs to authenticated;
grant select, insert, update on public.matches to authenticated;
grant select, insert, update on public.match_participants to authenticated;

grant execute on function public.get_or_create_ranking_scope(text, text, text) to authenticated;
grant execute on function public.ensure_player_ranking(uuid, uuid) to authenticated;
grant execute on function public.confirm_match_participant(uuid, uuid) to authenticated;
