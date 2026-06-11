-- PierdePaga — premios por scope (país + provincia/ciudad + deporte)
-- Aplicar después de schema.sql y schema-game.sql

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.sponsor_prize_submissions
  add column if not exists country_id text;

alter table public.sponsor_prize_submissions
  add column if not exists province text;

alter table public.sponsor_prize_submissions
  add column if not exists sport_id text;

update public.sponsor_prize_submissions s
set
  country_id = coalesce(s.country_id, p.country_id, 'ar'),
  province = coalesce(nullif(s.province, ''), p.province, 'Formosa'),
  sport_id = coalesce(s.sport_id, 'padel')
from public.profiles p
where p.id = s.user_id
  and (s.country_id is null or s.province is null or s.sport_id is null);

update public.sponsor_prize_submissions
set
  country_id = coalesce(country_id, 'ar'),
  province = coalesce(nullif(province, ''), 'Formosa'),
  sport_id = coalesce(sport_id, 'padel')
where country_id is null or province is null or sport_id is null;

alter table public.sponsor_prize_submissions
  alter column country_id set default 'ar',
  alter column province set default '',
  alter column sport_id set default 'padel';

alter table public.sponsor_prize_submissions
  alter column country_id set not null,
  alter column province set not null,
  alter column sport_id set not null;

alter table public.sponsor_prize_submissions
  add column if not exists scope_id uuid references public.ranking_scopes (id);

update public.sponsor_prize_submissions s
set scope_id = public.get_or_create_ranking_scope(
  s.country_id,
  s.province,
  s.sport_id
)
where scope_id is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sponsor_prize_submissions'
      and column_name = 'sponsor_id'
  ) then
    alter table public.sponsor_prize_submissions
      rename column sponsor_id to user_id;
  end if;
end $$;

create index if not exists sponsor_prize_submissions_scope_idx
  on public.sponsor_prize_submissions (country_id, province, sport_id);

create index if not exists sponsor_prize_submissions_status_idx
  on public.sponsor_prize_submissions (status, created_at desc);

drop policy if exists "sponsor_prizes_select_own" on public.sponsor_prize_submissions;
drop policy if exists "sponsor_prizes_insert_own" on public.sponsor_prize_submissions;

drop policy if exists "prize_submissions_select_own" on public.sponsor_prize_submissions;
create policy "prize_submissions_select_own"
  on public.sponsor_prize_submissions for select
  using (auth.uid() = user_id);

drop policy if exists "prize_submissions_select_approved" on public.sponsor_prize_submissions;
create policy "prize_submissions_select_catalog"
  on public.sponsor_prize_submissions for select
  using (status in ('approved', 'pending'));

drop policy if exists "prize_submissions_admin_select" on public.sponsor_prize_submissions;
create policy "prize_submissions_admin_select"
  on public.sponsor_prize_submissions for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "prize_submissions_insert_own" on public.sponsor_prize_submissions;
create policy "prize_submissions_insert_own"
  on public.sponsor_prize_submissions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.account_type = 'sponsor'
    )
  );

drop policy if exists "prize_submissions_admin_update" on public.sponsor_prize_submissions;
create policy "prize_submissions_admin_update"
  on public.sponsor_prize_submissions for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
