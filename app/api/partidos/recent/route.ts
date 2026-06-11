import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchRecentPartidos } from '@/lib/supabase/partidos'

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
    const recientes = await fetchRecentPartidos(supabase, scope, 6)
    return NextResponse.json({ recientes })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudieron cargar los partidos'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
