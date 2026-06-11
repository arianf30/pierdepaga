-- PierdePaga — esquema inicial (aplicar con: npm run db:setup)

do $$ begin
  create type public.account_type as enum ('jugador', 'sponsor');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type public.account_type not null default 'jugador',
  first_name text not null default '',
  last_name text not null default '',
  display_name text not null default '',
  dni text,
  instagram text,
  avatar_url text,
  country_id text not null default 'ar',
  province text not null default 'Formosa',
  address text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists is_admin boolean not null default false;

create unique index if not exists profiles_dni_unique
  on public.profiles (dni)
  where dni is not null and dni <> '';

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_dni_duplicate_check" on public.profiles;
create policy "profiles_dni_duplicate_check"
  on public.profiles for select
  using (
    auth.uid() = id
    or (auth.uid() is not null and dni is not null and dni <> '')
  );

create table if not exists public.sponsor_prize_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  country_id text not null default 'ar',
  province text not null default '',
  sport_id text not null default 'padel',
  title text not null,
  detail text not null default '',
  sponsor_brand text not null default '',
  image_url text,
  prize_type text not null default 'ranking'
    check (prize_type in ('ranking', 'streak')),
  ranking_position smallint
    check (ranking_position is null or ranking_position between 1 and 3),
  streak_milestone smallint,
  quantity_available integer not null default 1
    check (quantity_available > 0),
  delivered_count integer not null default 0
    check (delivered_count >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'delivered')),
  created_at timestamptz not null default now()
);

alter table public.sponsor_prize_submissions
  add column if not exists prize_type text not null default 'ranking';
alter table public.sponsor_prize_submissions
  add column if not exists ranking_position smallint;
alter table public.sponsor_prize_submissions
  add column if not exists streak_milestone smallint;
alter table public.sponsor_prize_submissions
  add column if not exists quantity_available integer not null default 1;
alter table public.sponsor_prize_submissions
  add column if not exists delivered_count integer not null default 0;

alter table public.sponsor_prize_submissions
  drop constraint if exists sponsor_prize_submissions_status_check;
alter table public.sponsor_prize_submissions
  add constraint sponsor_prize_submissions_status_check
  check (status in ('pending', 'approved', 'rejected', 'delivered'));

alter table public.sponsor_prize_submissions enable row level security;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_upload_own" on storage.objects;
create policy "avatars_upload_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prize-images',
  'prize-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "prize_images_public_read" on storage.objects;
create policy "prize_images_public_read"
  on storage.objects for select
  using (bucket_id = 'prize-images');

drop policy if exists "prize_images_upload_own" on storage.objects;
create policy "prize_images_upload_own"
  on storage.objects for insert
  with check (
    bucket_id = 'prize-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "prize_images_update_own" on storage.objects;
create policy "prize_images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'prize-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'prize-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "prize_images_delete_own" on storage.objects;
create policy "prize_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'prize-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
