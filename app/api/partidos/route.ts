import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchPlayersSkillSnapshot } from '@/lib/supabase/ranking'
import { fetchPendingPartidosForUser } from '@/lib/supabase/partidos'
import { computeMatchTransfer, teamAverage } from '@/lib/ranking/formulas'
import { isCountryId, isSportId } from '@/lib/catalog'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const scope = {
    country: searchParams.get('country') ?? 'ar',
    province: searchParams.get('province') ?? 'Formosa',
    sport: searchParams.get('sport') ?? 'padel',
  }

  try {
    const partidos = await fetchPendingPartidosForUser(supabase, user.id, scope)
    return NextResponse.json({ partidos })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudieron cargar los partidos'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** Desglosa "6-4 7-5" en sets/games por equipo (A arriba, B abajo). */
function parseResultado(resultado: string): {
  sets_a: number
  sets_b: number
  games_a: number
  games_b: number
} {
  let sets_a = 0
  let sets_b = 0
  let games_a = 0
  let games_b = 0

  for (const token of resultado.trim().split(/\s+/)) {
    const [a, b] = token.split('-').map((n) => Number.parseInt(n, 10))
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue
    games_a += a
    games_b += b
    if (a > b) sets_a += 1
    else if (b > a) sets_b += 1
  }

  return { sets_a, sets_b, games_a, games_b }
}

type PartidoBody = {
  country?: string
  province?: string
  sport?: string
  j2a_id?: string
  j1b_id?: string
  j2b_id?: string
  ganador?: 'A' | 'B'
  resultado?: string
  club?: string
  fecha?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: PartidoBody
  try {
    body = (await request.json()) as PartidoBody
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const country = body.country ?? 'ar'
  const province = body.province ?? 'Formosa'
  const sport = body.sport ?? 'padel'

  if (!isCountryId(country) || !isSportId(sport)) {
    return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
  }

  // Equipo A: jugador 1 = quien carga (loader). Equipo B: jugador 1 y 2.
  const j1a_id = user.id
  const { j2a_id, j1b_id, j2b_id, ganador } = body

  if (!j2a_id || !j1b_id || !j2b_id) {
    return NextResponse.json(
      { error: 'Faltan jugadores del partido' },
      { status: 400 },
    )
  }

  const ids = [j1a_id, j2a_id, j1b_id, j2b_id]
  if (new Set(ids).size !== 4) {
    return NextResponse.json(
      { error: 'Los 4 jugadores deben ser distintos' },
      { status: 400 },
    )
  }

  if (ganador !== 'A' && ganador !== 'B') {
    return NextResponse.json(
      { error: 'Seleccioná el equipo ganador' },
      { status: 400 },
    )
  }

  if (!body.resultado?.trim()) {
    return NextResponse.json({ error: 'Falta el resultado' }, { status: 400 })
  }

  if (!body.club?.trim()) {
    return NextResponse.json({ error: 'Falta el club' }, { status: 400 })
  }

  try {
    // Habilidad + racha actuales de cada jugador en el ranking del scope.
    const snapshot = await fetchPlayersSkillSnapshot(
      supabase,
      { country, province, sport },
      ids,
    )

    const missing = ids.filter((id) => !snapshot.has(id))
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error:
            'Todos los jugadores deben estar inscriptos en el ranking de este país/provincia/deporte.',
        },
        { status: 400 },
      )
    }

    const habA1 = snapshot.get(j1a_id)!.habilidad ?? 0
    const habA2 = snapshot.get(j2a_id)!.habilidad ?? 0
    const habB1 = snapshot.get(j1b_id)!.habilidad ?? 0
    const habB2 = snapshot.get(j2b_id)!.habilidad ?? 0

    const avgA = teamAverage([habA1, habA2])
    const avgB = teamAverage([habB1, habB2])

    const winnerAvg = ganador === 'A' ? avgA : avgB
    const loserAvg = ganador === 'A' ? avgB : avgA
    const loserSkills: [number, number] =
      ganador === 'A' ? [habB1, habB2] : [habA1, habA2]

    // Puntos que gana cada jugador del equipo ganador (= que pierde cada perdedor).
    const puntosGanados = computeMatchTransfer(winnerAvg, loserAvg, loserSkills)

    const { sets_a, sets_b, games_a, games_b } = parseResultado(body.resultado)

    const { data, error } = await supabase
      .from('partidos')
      .insert({
        pais: country,
        provincia: province,
        deporte: sport,
        j1a_id,
        j2a_id,
        j1b_id,
        j2b_id,
        j1a_hab: snapshot.get(j1a_id)!.habilidad,
        j2a_hab: snapshot.get(j2a_id)!.habilidad,
        j1b_hab: snapshot.get(j1b_id)!.habilidad,
        j2b_hab: snapshot.get(j2b_id)!.habilidad,
        j1a_racha: snapshot.get(j1a_id)!.racha,
        j2a_racha: snapshot.get(j2a_id)!.racha,
        j1b_racha: snapshot.get(j1b_id)!.racha,
        j2b_racha: snapshot.get(j2b_id)!.racha,
        ganador,
        resultado: body.resultado.trim(),
        club: body.club.trim(),
        fecha: body.fecha ?? new Date().toISOString(),
        estado: 'pendiente',
        puntos_ganados: puntosGanados,
        sets_a,
        sets_b,
        games_a,
        games_b,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id, puntos_ganados: puntosGanados })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo cargar el partido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
