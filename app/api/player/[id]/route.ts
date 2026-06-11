import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchProfile } from '@/lib/supabase/profiles'
import { fetchPlayerScopeRanking } from '@/lib/supabase/ranking'
import { fetchPlayerMatchHistory } from '@/lib/supabase/partidos'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
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
    const profile = await fetchProfile(supabase, id)
    if (!profile) {
      return NextResponse.json(
        { error: 'Jugador no encontrado' },
        { status: 404 },
      )
    }

    const { entry, rank } = await fetchPlayerScopeRanking(supabase, scope, id)
    const matchHistory = await fetchPlayerMatchHistory(supabase, scope, id)

    return NextResponse.json({ profile, ranking: entry, rank, matchHistory })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo cargar el jugador'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
