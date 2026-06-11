'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { LoadMatchForm } from '@/components/challenges/load-match-form'

export function LoadMatchModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open])

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
            aria-labelledby="load-match-title"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border glass"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>

            <div className="border-b border-border px-6 pb-4 pt-6 pr-14">
              <p className="type-kicker">Partido simple</p>
              <h2
                id="load-match-title"
                className="mt-1 font-display text-xl font-semibold tracking-tight"
              >
                Cargar partido
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                2vs2 · mejor de 3 sets
              </p>
            </div>

            <div className="overflow-x-hidden p-6">
              <LoadMatchForm
                onSuccess={() => {
                  onSuccess?.()
                  onClose()
                }}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
