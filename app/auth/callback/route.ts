import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchProfile } from '@/lib/supabase/profiles'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        try {
          const existing = await fetchProfile(supabase, user.id)

          if (!existing) {
            return NextResponse.redirect(`${origin}/auth/onboarding`)
          }

          const destination =
            existing.account_type === 'sponsor' ? '/premios' : '/inicio'
          return NextResponse.redirect(`${origin}${destination}`)
        } catch {
          return NextResponse.redirect(
            `${origin}/login?error=auth&message=${encodeURIComponent('No se pudo verificar tu perfil. Intentá de nuevo.')}`,
          )
        }
      }

      return NextResponse.redirect(`${origin}/inicio`)
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=auth&message=${encodeURIComponent('No se pudo completar el inicio de sesión.')}`,
  )
}
