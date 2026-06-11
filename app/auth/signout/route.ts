import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function signOutAndRedirect(request: Request) {
  const cookieStore = await cookies()
  const redirect = NextResponse.redirect(new URL('/login', request.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            redirect.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  await supabase.auth.signOut()
  return redirect
}

export async function GET(request: Request) {
  return signOutAndRedirect(request)
}

export async function POST(request: Request) {
  return signOutAndRedirect(request)
}
