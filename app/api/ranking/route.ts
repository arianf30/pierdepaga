import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  fetchLeaderboard,
  fetchPlayerRanking,
  getOrCreateScope,
} from '@/lib/supabase/game'
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

  if (!isCountryId(countryId) || !isSportId(sportId)) {
    return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
  }

  try {
    const scope = await getOrCreateScope(
      supabase,
      countryId,
      province,
      sportId,
    )
    const leaderboard = await fetchLeaderboard(supabase, scope.id)
    const myRanking = await fetchPlayerRanking(supabase, scope.id, user.id)

    return NextResponse.json({
      scope,
      leaderboard,
      myRanking,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo cargar el ranking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
