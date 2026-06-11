import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SPONSOR_ALLOWED_PREFIXES = [
  '/premios',
  '/perfil',
  '/login',
  '/auth',
  '/_next',
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname === '/login' ||
    pathname === '/tipografias' ||
    pathname === '/logos' ||
    pathname === '/archivo' ||
    pathname.startsWith('/_next')

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', user.id)
      .maybeSingle()

    const isSponsor = profile?.account_type === 'sponsor'

    if (isSponsor) {
      const allowed = SPONSOR_ALLOWED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      )
      if (!allowed && !isPublic) {
        const url = request.nextUrl.clone()
        url.pathname = '/premios'
        return NextResponse.redirect(url)
      }
    }

    if (pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = isSponsor ? '/premios' : '/inicio'
      return NextResponse.redirect(url)
    }

    if (pathname === '/' && !isSponsor) {
      const url = request.nextUrl.clone()
      url.pathname = '/inicio'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
