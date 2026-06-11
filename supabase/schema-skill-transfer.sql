-- Fórmula logarítmica de traslado de habilidad (espejo de lib/ranking/formulas.ts)

drop function if exists public.compute_match_transfer(numeric, numeric, numeric, numeric);
drop function if exists public.compute_match_transfer(numeric, numeric);
drop function if exists public.cap_transfer_by_losers(integer, numeric, numeric, numeric, numeric);
drop function if exists public.apply_loser_transfer(numeric, numeric);
drop function if exists public.match_context_multiplier(numeric, numeric);
drop function if exists public.interpolate_level_transfer(numeric);

create or replace function public.interpolate_level_transfer(p_avg numeric)
returns integer
language plpgsql
immutable
as $$
declare
  v_avg numeric;
  v_a0 numeric;
  v_t0 numeric;
  v_a1 numeric;
  v_t1 numeric;
  v_w numeric;
begin
  v_avg := greatest(800, p_avg);

  if v_avg <= 800 then return 6; end if;
  if v_avg >= 2000 then
    return round(65 + (ln(v_avg / 2000.0) / ln(2400.0 / 2000.0)) * 12);
  end if;

  if v_avg <= 900 then
    v_w := ln(v_avg / 800.0) / ln(900.0 / 800.0);
    return round(6 + v_w * (11 - 6));
  elsif v_avg <= 1200 then
    v_w := ln(v_avg / 900.0) / ln(1200.0 / 900.0);
    return round(11 + v_w * (26 - 11));
  elsif v_avg <= 1400 then
    v_w := ln(v_avg / 1200.0) / ln(1400.0 / 1200.0);
    return round(26 + v_w * (32 - 26));
  elsif v_avg <= 1600 then
    v_w := ln(v_avg / 1400.0) / ln(1600.0 / 1400.0);
    return round(32 + v_w * (45 - 32));
  else
    v_w := ln(v_avg / 1600.0) / ln(2000.0 / 1600.0);
    return round(45 + v_w * (65 - 45));
  end if;
end;
$$;

create or replace function public.match_context_multiplier(
  p_winner_avg numeric,
  p_loser_avg numeric
)
returns numeric
language plpgsql
immutable
as $$
declare
  v_diff numeric;
  v_gap_norm numeric;
  v_expected numeric;
begin
  v_diff := p_loser_avg - p_winner_avg;
  if abs(v_diff) < 20 then return 1; end if;

  v_gap_norm := least(abs(v_diff) / 400.0, 2.5);
  v_expected := public.elo_expected(p_winner_avg, p_loser_avg);

  if v_diff > 0 then
    return 1 + 1.22 * v_gap_norm * (1 - v_expected);
  end if;

  return greatest(0.07, 1 - 0.48 * v_gap_norm * v_expected);
end;
$$;

create or replace function public.apply_loser_transfer(
  p_player_skill numeric,
  p_nominal_transfer numeric
)
returns integer
language sql
immutable
as $$
  select least(
    round(p_nominal_transfer)::integer,
    greatest(round(p_player_skill - 800)::integer, 0)
  );
$$;

create or replace function public.cap_transfer_by_losers(
  p_nominal integer,
  p_loser1 numeric,
  p_loser2 numeric,
  p_winner_avg numeric,
  p_loser_avg numeric
)
returns integer
language plpgsql
immutable
as $$
declare
  v_affordable integer;
begin
  v_affordable := least(
    public.apply_loser_transfer(p_loser1, p_nominal),
    public.apply_loser_transfer(p_loser2, p_nominal)
  );

  if v_affordable > 0 then
    return least(p_nominal, v_affordable);
  end if;

  if p_winner_avg > p_loser_avg + 300 and p_nominal <= 2 then
    return 1;
  end if;

  return 0;
end;
$$;

create or replace function public.compute_match_transfer(
  p_winner_avg numeric,
  p_loser_avg numeric,
  p_loser1 numeric default null,
  p_loser2 numeric default null
)
returns integer
language plpgsql
immutable
as $$
declare
  v_match_avg numeric;
  v_base integer;
  v_mult numeric;
  v_transfer integer;
begin
  v_match_avg := (p_winner_avg + p_loser_avg) / 2.0;
  v_base := public.interpolate_level_transfer(v_match_avg);
  v_mult := public.match_context_multiplier(p_winner_avg, p_loser_avg);
  v_transfer := round(v_base * v_mult);
  v_transfer := least(70, greatest(1, v_transfer));

  if p_loser1 is not null and p_loser2 is not null then
    v_transfer := public.cap_transfer_by_losers(
      v_transfer,
      p_loser1,
      p_loser2,
      p_winner_avg,
      p_loser_avg
    );
  end if;

  return v_transfer;
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
  v_loser1 numeric;
  v_loser2 numeric;
  v_transfer integer;
  rec record;
  v_skill numeric;
  v_delta integer;
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
    select
      max(case when mp.slot = 1 then coalesce(mp.skill_before, pr.skill_rating) end),
      max(case when mp.slot = 2 then coalesce(mp.skill_before, pr.skill_rating) end)
    into v_loser1, v_loser2
    from public.match_participants mp
    join public.player_rankings pr
      on pr.scope_id = v_scope_id and pr.player_id = mp.player_id
    where mp.match_id = p_match_id and mp.team = 'B';
  else
    v_winner_avg := v_team_b_avg;
    v_loser_avg := v_team_a_avg;
    select
      max(case when mp.slot = 1 then coalesce(mp.skill_before, pr.skill_rating) end),
      max(case when mp.slot = 2 then coalesce(mp.skill_before, pr.skill_rating) end)
    into v_loser1, v_loser2
    from public.match_participants mp
    join public.player_rankings pr
      on pr.scope_id = v_scope_id and pr.player_id = mp.player_id
    where mp.match_id = p_match_id and mp.team = 'A';
  end if;

  v_transfer := public.compute_match_transfer(
    v_winner_avg,
    v_loser_avg,
    v_loser1,
    v_loser2
  );

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

    v_new_skill := greatest(800, round(v_skill + v_delta));
    v_delta := round(v_new_skill - v_skill);

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
