'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Player } from '@/lib/data'

export function statusColor(status: Player['status']) {
  if (status === 'online') return 'bg-primary'
  if (status === 'in-match') return 'bg-accent'
  return 'bg-muted-foreground'
}

export function statusLabel(status: Player['status']) {
  if (status === 'online') return 'En línea'
  if (status === 'in-match') return 'En partido'
  return 'Desconectado'
}

export function rarityClasses(
  rarity: 'común' | 'raro' | 'épico' | 'legendario',
) {
  switch (rarity) {
    case 'legendario':
      return 'border-accent/50 text-accent ring-glow-gold'
    case 'épico':
      return 'border-primary/50 text-primary ring-glow-energy'
    case 'raro':
      return 'border-primary/30 text-primary/90'
    default:
      return 'border-border text-muted-foreground'
  }
}

export function SectionTitle({
  kicker,
  title,
  action,
}: {
  kicker?: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {kicker && <p className="type-kicker mb-1">{kicker}</p>}
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground lg:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

export function StatChip({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'win' | 'loss' | 'gold'
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-center">
      <p
        className={cn(
          'font-display text-2xl font-bold tabular-nums',
          tone === 'win' && 'text-primary',
          tone === 'loss' && 'text-destructive',
          tone === 'gold' && 'text-accent',
        )}
      >
        {value}
      </p>
      <p className="type-label mt-0.5 font-medium">{label}</p>
    </div>
  )
}

export function fadeUp(i = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.5,
      delay: i * 0.06,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground ring-glow-energy transition-shadow',
        className,
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/30 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ animation: 'sweep 1.2s ease-in-out infinite' }}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </motion.button>
  )
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
