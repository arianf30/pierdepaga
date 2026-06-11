-- PierdePaga — confirmación de partidos + impacto en el ranking
-- Aplicar después de schema-partidos.sql / schema-ranking.sql

-- ---------------------------------------------------------------------------
-- Columnas nuevas en partidos: scope del ranking + desglose de sets/games
-- ---------------------------------------------------------------------------

alter table public.partidos
  add column if not exists pais text,
  add column if not exists provincia text,
  add column if not exists deporte text,
  add column if not exists sets_a smallint not null default 0,
  add column if not exists sets_b smallint not null default 0,
  add column if not exists games_a smallint not null default 0,
  add column if not exists games_b smallint not null default 0;

-- estado pasa a admitir 'cargado'
alter table public.partidos drop constraint if exists partidos_estado_check;
alter table public.partidos
  add constraint partidos_estado_check
  check (estado in ('pendiente', 'cargado', 'confirmado', 'cancelado'));

-- ---------------------------------------------------------------------------
-- finalizar_partido: aplica el resultado al ranking de los 4 jugadores
-- ---------------------------------------------------------------------------

create or replace function public.finalizar_partido(p_partido_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p public.partidos;
  v_puntos numeric;
  rec record;
  v_cur public.ranking;
  v_streak int;
  v_new_streak int;
  v_won boolean;
  v_new_hab integer;
  v_new_pj int;
  v_new_pg int;
  v_new_pp int;
  v_new_sg int;
  v_new_sp int;
  v_new_gg int;
  v_new_gp int;
  v_score numeric;
begin
  select * into v_p from public.partidos where id = p_partido_id for update;
  if v_p.id is null or v_p.estado <> 'pendiente' then
    return;
  end if;

  if v_p.pais is null or v_p.provincia is null or v_p.deporte is null then
    raise exception 'El partido no tiene scope (pais/provincia/deporte)';
  end if;

  v_puntos := coalesce(v_p.puntos_ganados, 0);

  -- Posiciones previas del scope (para ultima_posicion / delta)
  drop table if exists _pp_old_pos;
  create temporary table _pp_old_pos as
    select jugador_id,
           row_number() over (order by score desc, habilidad desc) as pos
    from public.ranking
    where pais = v_p.pais and provincia = v_p.provincia and deporte = v_p.deporte;

  -- Aplicar a cada jugador
  for rec in
    select * from (values
      (v_p.j1a_id, 'A'),
      (v_p.j2a_id, 'A'),
      (v_p.j1b_id, 'B'),
      (v_p.j2b_id, 'B')
    ) as t(jugador_id, team)
  loop
    select * into v_cur
    from public.ranking
    where pais = v_p.pais and provincia = v_p.provincia and deporte = v_p.deporte
      and jugador_id = rec.jugador_id
    for update;

    if v_cur.id is null then
      continue;
    end if;

    v_won := rec.team = v_p.ganador;

    v_streak := coalesce(
      nullif(regexp_replace(coalesce(v_cur.racha, '0'), '[^0-9-]', '', 'g'), '')::int,
      0
    );
    v_new_streak := public.update_streak(v_streak, v_won);

    if v_won then
      v_new_hab := round(coalesce(v_cur.habilidad, 1200) + v_puntos);
    else
      v_new_hab := greatest(800, round(coalesce(v_cur.habilidad, 1200) - v_puntos));
    end if;

    v_new_pj := v_cur.pj + 1;
    v_new_pg := v_cur.pg + (case when v_won then 1 else 0 end);
    v_new_pp := v_cur.pp + (case when v_won then 0 else 1 end);

    if rec.team = 'A' then
      v_new_sg := v_cur.sets_ganados + coalesce(v_p.sets_a, 0);
      v_new_sp := v_cur.sets_perdidos + coalesce(v_p.sets_b, 0);
      v_new_gg := v_cur.games_ganados + coalesce(v_p.games_a, 0);
      v_new_gp := v_cur.games_perdidos + coalesce(v_p.games_b, 0);
    else
      v_new_sg := v_cur.sets_ganados + coalesce(v_p.sets_b, 0);
      v_new_sp := v_cur.sets_perdidos + coalesce(v_p.sets_a, 0);
      v_new_gg := v_cur.games_ganados + coalesce(v_p.games_b, 0);
      v_new_gp := v_cur.games_perdidos + coalesce(v_p.games_a, 0);
    end if;

    v_score := public.compute_composite_score(
      v_new_pj, v_new_pg, v_new_hab, v_new_streak
    );

    update public.ranking set
      habilidad = v_new_hab,
      pj = v_new_pj,
      pg = v_new_pg,
      pp = v_new_pp,
      sets_ganados = v_new_sg,
      sets_perdidos = v_new_sp,
      games_ganados = v_new_gg,
      games_perdidos = v_new_gp,
      racha = v_new_streak::text,
      score = v_score,
      max_habilidad = greatest(coalesce(max_habilidad, 0), v_new_hab),
      max_habilidad_fecha = case
        when v_new_hab > coalesce(max_habilidad, 0) then now()
        else max_habilidad_fecha end,
      max_racha = greatest(coalesce(max_racha, 0), v_new_streak),
      max_racha_fecha = case
        when v_new_streak > coalesce(max_racha, 0) then now()
        else max_racha_fecha end
    where id = v_cur.id;
  end loop;

  -- Marcar el partido como cargado
  update public.partidos set estado = 'cargado' where id = p_partido_id;

  -- Recalcular posiciones del scope: ultima_posicion = posición previa,
  -- max_posicion = mejor (menor) posición histórica.
  -- Solo se guarda posición para jugadores con 10+ partidos jugados.
  with newp as (
    select jugador_id,
           row_number() over (order by score desc, habilidad desc) as pos
    from public.ranking
    where pais = v_p.pais and provincia = v_p.provincia and deporte = v_p.deporte
  )
  update public.ranking r set
    ultima_posicion = case when r.pj >= 10 then o.pos else null end,
    max_posicion = case
      when r.pj >= 10 and n.pos < coalesce(r.max_posicion, 2147483647) then n.pos
      else r.max_posicion end,
    max_posicion_fecha = case
      when r.pj >= 10 and n.pos < coalesce(r.max_posicion, 2147483647) then now()
      else r.max_posicion_fecha end
  from _pp_old_pos o, newp n
  where r.jugador_id = o.jugador_id
    and r.jugador_id = n.jugador_id
    and r.pais = v_p.pais and r.provincia = v_p.provincia and r.deporte = v_p.deporte;

  drop table if exists _pp_old_pos;
end;
$$;

-- ---------------------------------------------------------------------------
-- confirmar_partido: el jugador autenticado confirma su participación.
-- Con 2 confirmaciones (de las 3 posibles) el partido se finaliza.
-- ---------------------------------------------------------------------------

create or replace function public.confirmar_partido(p_partido_id uuid)
returns public.partidos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p public.partidos;
  v_uid uuid := auth.uid();
  v_confirms int;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  select * into v_p from public.partidos where id = p_partido_id for update;
  if v_p.id is null then
    raise exception 'Partido no encontrado';
  end if;

  -- Marcar la confirmación del slot que corresponde al usuario.
  if v_uid = v_p.j2a_id then
    update public.partidos set j2a_confirm = true
      where id = p_partido_id and j2a_confirm = false;
  elsif v_uid = v_p.j1b_id then
    update public.partidos set j1b_confirm = true
      where id = p_partido_id and j1b_confirm = false;
  elsif v_uid = v_p.j2b_id then
    update public.partidos set j2b_confirm = true
      where id = p_partido_id and j2b_confirm = false;
  else
    raise exception 'No sos un jugador que deba confirmar este partido';
  end if;

  select * into v_p from public.partidos where id = p_partido_id for update;

  v_confirms :=
    (case when v_p.j2a_confirm then 1 else 0 end) +
    (case when v_p.j1b_confirm then 1 else 0 end) +
    (case when v_p.j2b_confirm then 1 else 0 end);

  if v_p.estado = 'pendiente' and v_confirms >= 2 then
    perform public.finalizar_partido(p_partido_id);
    select * into v_p from public.partidos where id = p_partido_id;
  end if;

  return v_p;
end;
$$;

grant execute on function public.confirmar_partido(uuid) to authenticated;
