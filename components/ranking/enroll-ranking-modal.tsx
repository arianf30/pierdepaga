'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy, X } from 'lucide-react'
import { GhostButton, PrimaryButton } from '@/components/ui-kit'

export function EnrollRankingModal({
  open,
  rankingTitle,
  onClose,
  onConfirm,
}: {
  open: boolean
  rankingTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSubmitting(false)
      setError(null)
    }
  }, [open])

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo completar la inscripción',
      )
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enroll-ranking-title"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border glass"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>

            <div className="px-6 pb-6 pt-8">
              <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
                <Trophy className="size-6 text-primary" />
              </div>

              <p className="type-kicker">Inscripción gratis</p>
              <h2
                id="enroll-ranking-title"
                className="mt-1 font-display text-xl font-semibold tracking-tight"
              >
                Sumarte al {rankingTitle}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Vas a entrar al ranking con{' '}
                <span className="font-semibold text-foreground">1200</span> de
                habilidad inicial y{' '}
                <span className="font-semibold text-foreground">0</span> partidos
                jugados. A medida que cargues partidos vas a ir escalando
                posiciones.
              </p>

              {error && (
                <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <GhostButton
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="sm:w-auto"
                >
                  Cancelar
                </GhostButton>
                <PrimaryButton
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="sm:w-auto"
                >
                  {submitting ? 'Inscribiendo…' : 'Confirmar inscripción'}
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
