'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Mail, Trophy } from 'lucide-react'
import { Atmosphere } from '@/components/atmosphere'
import { BrandLogo } from '@/components/brand-logo'
import { fadeUp, GhostButton, PrimaryButton } from '@/components/ui-kit'
import { createClient } from '@/lib/supabase/client'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

type AuthMode = 'signin' | 'signup'

const inputClass =
  'w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/25'

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.85}
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.7}
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.55}
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

async function redirectAfterSession(router: ReturnType<typeof useRouter>) {
  const response = await fetch('/api/profile', {
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 404) {
    router.replace('/auth/onboarding')
    router.refresh()
    return
  }

  if (!response.ok) {
    throw new Error('No se pudo verificar tu perfil.')
  }

  const body = (await response.json()) as {
    profile?: { account_type?: string }
  }

  const destination =
    body.profile?.account_type === 'sponsor' ? routes.prizes : routes.home
  router.replace(destination)
  router.refresh()
}

export function LoginScreen({ errorMessage }: { errorMessage?: string | null }) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(errorMessage ?? null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleGoogleLogin() {
    if (loading || googleLoading) return
    setGoogleLoading(true)
    setError(null)
    setInfo(null)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback`

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (authError) {
        setError(authError.message)
        setGoogleLoading(false)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al conectar con Google',
      )
      setGoogleLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading || googleLoading) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Completá correo y contraseña.')
      return
    }

    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      const supabase = createClient()

      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) throw signUpError

        if (data.session) {
          await redirectAfterSession(router)
          return
        }

        setInfo(
          'Te enviamos un correo de confirmación. Abrilo para activar tu cuenta.',
        )
        setMode('signin')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (signInError) throw signInError

      await redirectAfterSession(router)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo completar el acceso',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Atmosphere />

      <div className="pointer-events-none absolute inset-0 grid-texture opacity-30" />

      <header className="relative z-10 px-5 pt-8 sm:px-8 lg:px-10">
        <Link href={routes.landing} aria-label="Volver al inicio">
          <BrandLogo size="lg" />
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col items-center justify-center gap-10 px-5 pb-12 lg:flex-row lg:items-center lg:gap-20">
        <motion.div {...fadeUp(0)} className="max-w-lg text-center lg:text-left">
          <span className="type-badge mb-4 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-primary">
            <Trophy className="size-3.5" />
            Acceso a la cancha
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Entrá.
            <br />
            <span className="text-primary text-glow-energy">Competí.</span>
            <br />
            <span className="text-foreground/90">Que pague el rival.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Entrá con correo y contraseña o con Google. Si es tu primera vez,
            elegís si venís a jugar o a sponsorear premios.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(1)}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-6 shadow-[0_0_80px_oklch(0.78_0.14_195/0.1)] backdrop-blur-xl sm:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="mb-5 flex rounded-xl border border-border bg-secondary/30 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setError(null)
                setInfo(null)
              }}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                mode === 'signin'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError(null)
                setInfo(null)
              }}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                mode === 'signup'
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Registrarse
            </button>
          </div>

          {(error || errorMessage) && (
            <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error ?? errorMessage}
            </p>
          )}

          {info && (
            <p className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
              {info}
            </p>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="type-label mb-1.5 block text-[11px]" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={cn(inputClass, 'pl-10')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label
                className="type-label mb-1.5 block text-[11px]"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                required
                minLength={6}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <PrimaryButton type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {mode === 'signup' ? 'Creando cuenta…' : 'Entrando…'}
                </>
              ) : mode === 'signup' ? (
                'Crear cuenta'
              ) : (
                'Entrar con correo'
              )}
            </PrimaryButton>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GhostButton
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={loading || googleLoading}
            className="w-full border-white/10 bg-white text-[#1f1f1f] hover:bg-white/95 hover:text-[#1f1f1f]"
          >
            <GoogleIcon />
            {googleLoading ? 'Conectando con Google…' : 'Continuar con Google'}
          </GhostButton>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
            Al registrarte aceptás las reglas de PierdePaga en tu provincia.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
