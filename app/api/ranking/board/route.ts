import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  enrollInRanking,
  fetchMyRankingRow,
  fetchScopeRanking,
} from '@/lib/supabase/ranking'
import { isCountryId, isSportId } from '@/lib/catalog'

function parseScope(searchParams: URLSearchParams) {
  return {
    country: searchParams.get('country') ?? 'ar',
    province: searchParams.get('province') ?? 'Formosa',
    sport: searchParams.get('sport') ?? 'padel',
  }
}

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
  const scope = parseScope(searchParams)

  if (!isCountryId(scope.country) || !isSportId(scope.sport)) {
    return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
  }

  try {
    const leaderboard = await fetchScopeRanking(supabase, scope)
    const myRow = await fetchMyRankingRow(supabase, scope, user.id)

    return NextResponse.json({ scope, leaderboard, myRow })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo cargar el ranking'
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

  const { searchParams } = new URL(request.url)
  const scope = parseScope(searchParams)

  if (!isCountryId(scope.country) || !isSportId(scope.sport)) {
    return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
  }

  try {
    const row = await enrollInRanking(supabase, scope, user.id)
    return NextResponse.json({ row })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo completar la inscripción'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
