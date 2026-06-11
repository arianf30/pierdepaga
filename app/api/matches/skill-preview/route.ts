import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateScope, resolveMatchSkillStakes } from '@/lib/supabase/game'
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
  const countryId = searchParams.get('country') ?? 'ar'
  const province = searchParams.get('province') ?? 'Formosa'
  const sportId = searchParams.get('sport') ?? 'padel'
  const teamA = searchParams.getAll('team_a')
  const teamB = searchParams.getAll('team_b')

  if (!isCountryId(countryId) || !isSportId(sportId)) {
    return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
  }

  if (teamA.length !== 2 || teamB.length !== 2) {
    return NextResponse.json(
      { error: 'Se requieren 4 jugadores distintos' },
      { status: 400 },
    )
  }

  const all = [...teamA, ...teamB]
  if (new Set(all).size !== 4) {
    return NextResponse.json(
      { error: 'Los 4 jugadores deben ser distintos' },
      { status: 400 },
    )
  }

  try {
    const scope = await getOrCreateScope(
      supabase,
      countryId,
      province,
      sportId,
    )
    const stakes = await resolveMatchSkillStakes(
      supabase,
      scope.id,
      [teamA[0], teamA[1]],
      [teamB[0], teamB[1]],
    )

    return NextResponse.json({ stakes, scope })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo calcular la habilidad'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
