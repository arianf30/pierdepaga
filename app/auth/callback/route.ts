import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/supabase/profiles'
import type { AccountType } from '@/lib/types/account'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/inicio'
  const accountType: AccountType =
    searchParams.get('account_type') === 'sponsor' ? 'sponsor' : 'jugador'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        try {
          const profile = await ensureProfile(supabase, user, accountType)
          const destination =
            profile.account_type === 'sponsor' ? '/premios' : next
          return NextResponse.redirect(`${origin}${destination}`)
        } catch {
          return NextResponse.redirect(
            `${origin}/login?error=auth&message=${encodeURIComponent('No se pudo crear tu perfil. Verificá que el esquema de Supabase esté aplicado.')}`,
          )
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=auth&message=${encodeURIComponent('No se pudo completar el inicio de sesión.')}`,
  )
}
