import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  fetchPendingMatchesDetailed,
  getOrCreateScope,
  searchPlayersInScope,
} from '@/lib/supabase/game'

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
  const query = searchParams.get('q') ?? ''
  const exclude = searchParams.getAll('exclude')

  try {
    const scope = await getOrCreateScope(
      supabase,
      countryId,
      province,
      sportId,
    )
    const players = await searchPlayersInScope(
      supabase,
      scope.id,
      query,
      exclude,
      20,
    )

    return NextResponse.json({ players, scope })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudieron buscar jugadores'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
