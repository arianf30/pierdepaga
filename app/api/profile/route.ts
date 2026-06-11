import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile, fetchProfile } from '@/lib/supabase/profiles'
import type { AccountType } from '@/lib/types/account'

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
    const row = await fetchProfile(supabase, user.id)
    if (!row) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ profile: row })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo cargar el perfil'
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
    const existing = await fetchProfile(supabase, user.id)
    if (existing) {
      return NextResponse.json({ profile: existing })
    }

    const body = (await request.json()) as { account_type?: string }
    const accountType: AccountType =
      body.account_type === 'sponsor' ? 'sponsor' : 'jugador'

    const row = await ensureProfile(supabase, user, accountType)
    return NextResponse.json({ profile: row })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo crear el perfil'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
