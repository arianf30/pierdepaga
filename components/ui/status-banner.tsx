'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusBannerProps = {
  type: 'success' | 'error'
  message: string
  onDismiss: () => void
  autoHideMs?: number
  className?: string
}

export function StatusBanner({
  type,
  message,
  onDismiss,
  autoHideMs = 4500,
  className,
}: StatusBannerProps) {
  useEffect(() => {
    if (type !== 'success') return
    const timer = setTimeout(onDismiss, autoHideMs)
    return () => clearTimeout(timer)
  }, [type, autoHideMs, onDismiss])

  const isSuccess = type === 'success'

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm',
        isSuccess
          ? 'border-primary/35 bg-primary/10 text-foreground'
          : 'border-destructive/35 bg-destructive/10 text-foreground',
        className,
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
      ) : (
        <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
      )}
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        aria-label="Cerrar aviso"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  )
}
