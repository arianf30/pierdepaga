'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { Atmosphere } from '@/components/atmosphere'
import { BrandLogo } from '@/components/brand-logo'
import { AccountTypePicker } from '@/components/auth/account-type-picker'
import { PrimaryButton, fadeUp } from '@/components/ui-kit'
import type { AccountType } from '@/lib/types/account'
import { routes } from '@/lib/routes'

export function OnboardingScreen() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<AccountType>('jugador')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ account_type: accountType }),
      })

      const raw = await response.text()
      let body: { error?: string } = {}
      try {
        body = raw ? (JSON.parse(raw) as { error?: string }) : {}
      } catch {
        throw new Error('No se pudo crear tu perfil. Probá recargar la página.')
      }

      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudo crear tu perfil')
      }

      router.replace(accountType === 'sponsor' ? routes.prizes : routes.home)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo crear tu perfil',
      )
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Atmosphere />
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-30" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 py-12">
        <motion.div {...fadeUp(0)} className="mb-8 text-center">
          <BrandLogo size="lg" className="mx-auto" />
        </motion.div>

        <motion.div
          {...fadeUp(1)}
          className="relative w-full overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-6 shadow-[0_0_80px_oklch(0.78_0.14_195/0.1)] backdrop-blur-xl sm:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <span className="type-badge mb-4 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-primary">
            <Sparkles className="size-3.5" />
            Primera vez acá
          </span>

          <h1 className="text-2xl font-semibold tracking-tight">
            ¿Cómo venís a PierdePaga?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Elegí tu tipo de cuenta. Después podés completar tu perfil con tus
            datos.
          </p>

          <div className="mt-6">
            <AccountTypePicker value={accountType} onChange={setAccountType} />
          </div>

          {error && (
            <p className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <PrimaryButton
            type="button"
            className="mt-6 w-full"
            disabled={loading}
            onClick={() => void handleContinue()}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creando tu perfil…
              </>
            ) : (
              'Continuar'
            )}
          </PrimaryButton>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
            {accountType === 'jugador'
              ? 'Vas a poder competir, ver el ranking y cargar partidos.'
              : 'Como sponsor solo podés postular premios y editar tu perfil.'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
