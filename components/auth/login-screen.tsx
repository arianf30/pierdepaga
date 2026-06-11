'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gift, Swords, Trophy } from 'lucide-react'
import { Atmosphere } from '@/components/atmosphere'
import { BrandLogo } from '@/components/brand-logo'
import { fadeUp } from '@/components/ui-kit'
import { createClient } from '@/lib/supabase/client'
import type { AccountType } from '@/lib/types/account'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'

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

function RoleOption({
  type,
  selected,
  onSelect,
}: {
  type: AccountType
  selected: boolean
  onSelect: () => void
}) {
  const isPlayer = type === 'jugador'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex flex-1 flex-col items-start rounded-2xl border px-4 py-4 text-left transition-all duration-200',
        isPlayer ? 'min-h-[7.5rem]' : 'min-h-[6.5rem] opacity-80 hover:opacity-100',
        selected && isPlayer
          ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/30 shadow-[0_0_32px_oklch(0.78_0.14_195/0.18)]'
          : selected && !isPlayer
            ? 'border-accent/45 bg-accent/8 ring-1 ring-accent/25'
            : 'border-border/80 bg-secondary/20 hover:border-border',
      )}
    >
      {selected && isPlayer && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}
      <span
        className={cn(
          'mb-3 grid place-items-center rounded-xl border',
          isPlayer ? 'size-10' : 'size-9',
          selected && isPlayer
            ? 'border-primary/40 bg-primary/15 text-primary'
            : selected && !isPlayer
              ? 'border-accent/35 bg-accent/10 text-accent'
              : 'border-border bg-background/40 text-muted-foreground',
        )}
      >
        {isPlayer ? (
          <Swords className="size-5" strokeWidth={2} />
        ) : (
          <Gift className="size-4" strokeWidth={2} />
        )}
      </span>
      <span
        className={cn(
          'font-display font-bold uppercase tracking-wide',
          isPlayer ? 'text-sm' : 'text-xs',
          selected && isPlayer && 'text-primary',
          selected && !isPlayer && 'text-accent',
          !selected && 'text-foreground',
        )}
      >
        {isPlayer ? 'Jugador' : 'Sponsor'}
      </span>
      <span className="mt-1 text-[11px] leading-snug text-muted-foreground">
        {isPlayer
          ? 'Competí, subí en el ranking y cargá partidos.'
          : 'Postulá premios para la comunidad.'}
      </span>
      {isPlayer && selected && (
        <span className="type-badge mt-3 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary">
          Recomendado
        </span>
      )}
    </button>
  )
}

export function LoginScreen({ errorMessage }: { errorMessage?: string | null }) {
  const [accountType, setAccountType] = useState<AccountType>('jugador')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(errorMessage ?? null)

  async function handleGoogleLogin() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const next = accountType === 'sponsor' ? '/premios' : '/inicio'
      const redirectTo = `${window.location.origin}/auth/callback?account_type=${accountType}&next=${encodeURIComponent(next)}`

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (authError) {
        setError(authError.message)
        setLoading(false)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al conectar con Google',
      )
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
            Un solo acceso con Google. Elegí si venís a jugar o a sponsorear
            premios para los mejores de cada provincia.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(1)}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-6 shadow-[0_0_80px_oklch(0.78_0.14_195/0.1)] backdrop-blur-xl sm:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="mb-6">
            <p className="type-kicker">Tipo de cuenta</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Por defecto entrás como jugador
            </p>
          </div>

          <div className="flex gap-3">
            <RoleOption
              type="jugador"
              selected={accountType === 'jugador'}
              onSelect={() => setAccountType('jugador')}
            />
            <RoleOption
              type="sponsor"
              selected={accountType === 'sponsor'}
              onSelect={() => setAccountType('sponsor')}
            />
          </div>

          {(error || errorMessage) && (
            <p className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error ?? errorMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={cn(
              'mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-5 py-3.5 text-sm font-semibold text-[#1f1f1f] transition-all',
              'hover:bg-white/95 hover:shadow-[0_0_24px_rgba(255,255,255,0.12)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <GoogleIcon />
            {loading ? 'Conectando con Google…' : 'Continuar con Google'}
          </button>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
            {accountType === 'jugador'
              ? 'Al registrarte aceptás competir en el ecosistema PierdePaga de tu provincia.'
              : 'Como sponsor solo podés postular premios. No tenés acceso a partidos ni ranking.'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
