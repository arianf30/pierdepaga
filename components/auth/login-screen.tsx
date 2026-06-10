'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { Atmosphere } from '@/components/atmosphere'
import { PrimaryButton, fadeUp } from '@/components/ui-kit'
import { BrandLogo } from '@/components/brand-logo'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#fff"
        fillOpacity={0.9}
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#fff"
        fillOpacity={0.75}
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#fff"
        fillOpacity={0.6}
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#fff"
        fillOpacity={0.5}
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function LoginScreen({ errorMessage }: { errorMessage?: string | null }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(errorMessage ?? null)

  async function handleGoogleLogin() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (authError) {
        setError(authError.message)
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Google')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Atmosphere />

      <header className="relative z-10 px-5 pt-8 sm:px-8 lg:px-10">
        <BrandLogo size="lg" className="mx-auto block w-fit lg:mx-0" />
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-6xl flex-col items-center justify-center gap-10 px-5 pb-12 lg:flex-row lg:gap-16">
        <motion.div {...fadeUp(0)} className="max-w-md text-center lg:text-left">
          <span className="type-badge mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
            <Flame className="size-3.5" /> El que pierde, paga
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Entrá a la
            <br />
            <span className="text-primary text-glow-energy">cancha</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Ranking, desafíos y pierde paga. Competí, subí de nivel y hacé que
            tu rival pague la cancha.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(1)}
          className="w-full max-w-md rounded-3xl border border-border glass p-8 sm:p-10"
        >
          <div className="mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              Iniciá sesión para continuar
            </p>
          </div>

          {(error || errorMessage) && (
            <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error ?? errorMessage}
            </p>
          )}

          <PrimaryButton
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            {loading ? 'Conectando…' : 'Entrar con Google'}
          </PrimaryButton>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            WhatsApp y otros roles disponibles pronto
          </p>
        </motion.div>
      </div>
    </div>
  )
}
