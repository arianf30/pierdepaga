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
  sets_won integer not null default 0,
  sets_lost integer not null default 0,
  games_won integer not null default 0,
  games_lost integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  using (auth.uid() = id);

create table if not exists public.sponsor_prize_submissions (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  detail text not null default '',
  sponsor_brand text not null default '',
  image_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.sponsor_prize_submissions enable row level security;

drop policy if exists "sponsor_prizes_select_own" on public.sponsor_prize_submissions;
create policy "sponsor_prizes_select_own"
  on public.sponsor_prize_submissions for select
  using (auth.uid() = sponsor_id);

drop policy if exists "sponsor_prizes_insert_own" on public.sponsor_prize_submissions;
create policy "sponsor_prizes_insert_own"
  on public.sponsor_prize_submissions for insert
  with check (
    auth.uid() = sponsor_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.account_type = 'sponsor'
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
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
