import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createPendingMatch,
  fetchPendingMatchesDetailed,
} from '@/lib/supabase/game'
import type { CreateMatchInput, TeamSide } from '@/lib/types/game'
import { isCountryId, isSportId } from '@/lib/catalog'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const pending = await fetchPendingMatchesDetailed(supabase, user.id)
    return NextResponse.json({ pending })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudieron cargar partidos'
    return NextResponse.json({ error: message }, { status: 500 })
  }
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

  try {
    const body = (await request.json()) as Partial<CreateMatchInput>

    if (
      !body.club_name?.trim() ||
      !body.score?.trim() ||
      !body.played_at ||
      !body.winner_team ||
      !body.team_a?.length ||
      !body.team_b?.length
    ) {
      return NextResponse.json(
        { error: 'Faltan datos del partido' },
        { status: 400 },
      )
    }

    const countryId = body.club_country_id ?? 'ar'
    const sportId = body.sport_id ?? 'padel'

    if (!isCountryId(countryId) || !isSportId(sportId)) {
      return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
    }

    if (!body.club_province?.trim()) {
      return NextResponse.json(
        { error: 'La provincia del club es obligatoria' },
        { status: 400 },
      )
    }

    const teamA = body.team_a as [string, string]
    const teamB = body.team_b as [string, string]
    const allPlayers = [...teamA, ...teamB]

    if (new Set(allPlayers).size !== 4) {
      return NextResponse.json(
        { error: 'Los 4 jugadores deben ser distintos' },
        { status: 400 },
      )
    }

    if (!allPlayers.includes(user.id)) {
      return NextResponse.json(
        { error: 'Tenés que ser uno de los participantes' },
        { status: 400 },
      )
    }

    const match = await createPendingMatch(supabase, user.id, {
      match_type: body.match_type === 'pierde_paga' ? 'pierde_paga' : 'simple',
      club_id: body.club_id ?? null,
      club_name: body.club_name.trim(),
      club_country_id: countryId,
      club_province: body.club_province.trim(),
      sport_id: sportId,
      played_at: body.played_at,
      score: body.score.trim(),
      winner_team: body.winner_team as TeamSide,
      stake_amount: body.stake_amount ?? null,
      team_a: teamA,
      team_b: teamB,
    })

    return NextResponse.json({ match })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo cargar el partido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
