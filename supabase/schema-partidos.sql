-- PierdePaga — tabla de partidos (versión plana ligada a desafíos)
-- Aplicar después de schema.sql / schema-game.sql

create table if not exists public.partidos (
  id uuid primary key default gen_random_uuid(),

  -- Relación con desafíos (la tabla desafios aún no existe; FK se agrega luego)
  desafio_id uuid,

  -- Jugadores: equipo A (j1a_id, j2a_id) y equipo B (j1b_id, j2b_id)
  -- j1a_id es quien carga el partido: no necesita confirmar.
  j1a_id uuid references public.profiles (id) on delete set null,
  j1a_racha text,
  j2a_id uuid references public.profiles (id) on delete set null,
  j2a_racha text,
  j2a_confirm boolean not null default false,
  j2a_token_confirm uuid not null default gen_random_uuid(),
  j1b_id uuid references public.profiles (id) on delete set null,
  j1b_racha text,
  j1b_confirm boolean not null default false,
  j1b_token_confirm uuid not null default gen_random_uuid(),
  j2b_id uuid references public.profiles (id) on delete set null,
  j2b_racha text,
  j2b_confirm boolean not null default false,
  j2b_token_confirm uuid not null default gen_random_uuid(),

  -- Habilidad de cada jugador (3 a 4 dígitos)
  j1a_hab integer check (j1a_hab is null or j1a_hab between 100 and 9999),
  j2a_hab integer check (j2a_hab is null or j2a_hab between 100 and 9999),
  j1b_hab integer check (j1b_hab is null or j1b_hab between 100 and 9999),
  j2b_hab integer check (j2b_hab is null or j2b_hab between 100 and 9999),

  ganador text check (ganador in ('A', 'B')),
  resultado text,
  fecha timestamptz not null default now(),
  club text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmado', 'cancelado')),
  puntos_ganados numeric(8, 2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partidos_desafio_idx
  on public.partidos (desafio_id);

create index if not exists partidos_fecha_idx
  on public.partidos (fecha desc);

-- Tokens de confirmación por link (WhatsApp / mail): únicos para buscar al resolver
create unique index if not exists partidos_j2a_token_idx
  on public.partidos (j2a_token_confirm);
create unique index if not exists partidos_j1b_token_idx
  on public.partidos (j1b_token_confirm);
create unique index if not exists partidos_j2b_token_idx
  on public.partidos (j2b_token_confirm);

-- updated_at automático (reutiliza patrón de profiles)
create or replace function public.set_partidos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists partidos_updated_at on public.partidos;
create trigger partidos_updated_at
  before update on public.partidos
  for each row execute function public.set_partidos_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.partidos enable row level security;

drop policy if exists "partidos_select_authenticated" on public.partidos;
create policy "partidos_select_authenticated"
  on public.partidos for select
  to authenticated
  using (true);

drop policy if exists "partidos_insert_participant" on public.partidos;
create policy "partidos_insert_participant"
  on public.partidos for insert
  to authenticated
  with check (auth.uid() in (j1a_id, j2a_id, j1b_id, j2b_id));

drop policy if exists "partidos_update_participant" on public.partidos;
create policy "partidos_update_participant"
  on public.partidos for update
  to authenticated
  using (auth.uid() in (j1a_id, j2a_id, j1b_id, j2b_id))
  with check (auth.uid() in (j1a_id, j2a_id, j1b_id, j2b_id));

grant select, insert, update on public.partidos to authenticated;
