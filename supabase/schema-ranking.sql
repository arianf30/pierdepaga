-- PierdePaga — tabla de ranking (versión plana por país/provincia/deporte)
-- Aplicar después de schema.sql / schema-game.sql
-- Valores válidos según lib/catalog.ts (países, provincias, deportes)

create table if not exists public.ranking (
  id uuid primary key default gen_random_uuid(),

  pais text not null
    check (pais in ('ar', 'py')),
  provincia text not null,
  deporte text not null
    check (deporte in ('padel')),

  -- Combinación país ↔ provincia válida (lib/catalog.ts)
  constraint ranking_pais_provincia_check check (
    (pais = 'ar' and provincia in ('Formosa', 'Resistencia', 'Corrientes', 'Prueba'))
    or (pais = 'py' and provincia in ('Asunción'))
  ),

  jugador_id uuid not null references public.profiles (id) on delete cascade,

  pj integer not null default 0 check (pj >= 0),
  pg integer not null default 0 check (pg >= 0),
  pp integer not null default 0 check (pp >= 0),

  sets_ganados integer not null default 0 check (sets_ganados >= 0),
  sets_perdidos integer not null default 0 check (sets_perdidos >= 0),
  games_ganados integer not null default 0 check (games_ganados >= 0),
  games_perdidos integer not null default 0 check (games_perdidos >= 0),

  -- Habilidad: 3 a 4 dígitos
  habilidad integer check (habilidad is null or habilidad between 100 and 9999),

  racha text,
  -- Score: hasta 2 dígitos enteros y hasta 5 decimales (ej. 99.99999)
  score numeric(7, 5) not null default 0,
  ultima_posicion integer,

  -- Récords históricos (pico + cuándo se alcanzó)
  max_habilidad integer check (max_habilidad is null or max_habilidad between 100 and 9999),
  max_habilidad_fecha timestamptz,
  max_racha integer,
  max_racha_fecha timestamptz,
  max_posicion integer,
  max_posicion_fecha timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Un ranking por jugador en cada scope (país + provincia + deporte)
  unique (pais, provincia, deporte, jugador_id)
);

create index if not exists ranking_scope_score_idx
  on public.ranking (pais, provincia, deporte, score desc);

create index if not exists ranking_jugador_idx
  on public.ranking (jugador_id);

-- updated_at automático
create or replace function public.set_ranking_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ranking_updated_at on public.ranking;
create trigger ranking_updated_at
  before update on public.ranking
  for each row execute function public.set_ranking_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.ranking enable row level security;

drop policy if exists "ranking_select_authenticated" on public.ranking;
create policy "ranking_select_authenticated"
  on public.ranking for select
  to authenticated
  using (true);

-- Auto-inscripción: cada jugador puede crear su propia fila en el ranking
drop policy if exists "ranking_insert_own" on public.ranking;
create policy "ranking_insert_own"
  on public.ranking for insert
  to authenticated
  with check (auth.uid() = jugador_id);

grant select, insert on public.ranking to authenticated;
