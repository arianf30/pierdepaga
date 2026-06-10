'use client'

import { motion } from 'framer-motion'
import {
  CloudSnow,
  Flame,
  Snowflake,
  Sparkles,
  Sun,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatStreakValue, getStreakVisualTier } from '@/lib/streaks'

const ICON = 'size-5'

type EpicStep = {
  Icon: LucideIcon
  aura?: string
  iconClass: string
  glow?: string
  stroke: number
  pulse?: boolean
}

const HOT_EPIC: EpicStep[] = [
  {
    Icon: Flame,
    aura: 'bg-amber-400/25',
    iconClass: 'text-amber-400',
    glow: 'drop-shadow-[0_0_4px_oklch(0.75_0.14_75/0.5)]',
    stroke: 2,
  },
  {
    Icon: Flame,
    aura: 'bg-orange-500/35',
    iconClass: 'text-orange-300',
    glow: 'drop-shadow-[0_0_6px_oklch(0.72_0.17_55/0.55)]',
    stroke: 2.1,
  },
  {
    Icon: Zap,
    aura: 'bg-orange-500/45',
    iconClass: 'text-orange-200',
    glow: 'drop-shadow-[0_0_8px_oklch(0.7_0.2_45/0.65)]',
    stroke: 2.2,
  },
  {
    Icon: Flame,
    aura: 'bg-red-500/50',
    iconClass: 'text-red-200',
    glow: 'drop-shadow-[0_0_10px_oklch(0.62_0.24_25/0.7)]',
    stroke: 2.25,
    pulse: true,
  },
  {
    Icon: Sun,
    aura: 'bg-accent/45',
    iconClass: 'text-accent',
    glow: 'drop-shadow-[0_0_12px_oklch(0.78_0.14_85/0.75)]',
    stroke: 2.25,
    pulse: true,
  },
  {
    Icon: Sun,
    aura: 'bg-yellow-300/55',
    iconClass: 'text-yellow-100',
    glow: 'drop-shadow-[0_0_14px_oklch(0.86_0.16_90/0.8)]',
    stroke: 2.35,
    pulse: true,
  },
  {
    Icon: Sparkles,
    aura: 'bg-gradient-to-br from-yellow-200/60 to-orange-400/50',
    iconClass: 'text-yellow-50',
    glow: 'drop-shadow-[0_0_16px_oklch(0.9_0.14_95/0.85)]',
    stroke: 2.4,
    pulse: true,
  },
]

const COLD_EPIC: EpicStep[] = [
  {
    Icon: CloudSnow,
    aura: 'bg-sky-400/20',
    iconClass: 'text-sky-300/90',
    glow: 'drop-shadow-[0_0_4px_oklch(0.72_0.1_230/0.45)]',
    stroke: 2,
  },
  {
    Icon: Snowflake,
    aura: 'bg-cyan-400/30',
    iconClass: 'text-cyan-200',
    glow: 'drop-shadow-[0_0_6px_oklch(0.7_0.12_210/0.5)]',
    stroke: 2,
  },
  {
    Icon: Snowflake,
    aura: 'bg-blue-400/40',
    iconClass: 'text-blue-200',
    glow: 'drop-shadow-[0_0_8px_oklch(0.6_0.14_250/0.55)]',
    stroke: 2.1,
  },
  {
    Icon: Wind,
    aura: 'bg-blue-500/45',
    iconClass: 'text-sky-100',
    glow: 'drop-shadow-[0_0_10px_oklch(0.55_0.12_260/0.6)]',
    stroke: 2.2,
    pulse: true,
  },
  {
    Icon: Snowflake,
    aura: 'bg-indigo-400/50',
    iconClass: 'text-indigo-100',
    glow: 'drop-shadow-[0_0_12px_oklch(0.52_0.12_270/0.65)]',
    stroke: 2.25,
    pulse: true,
  },
  {
    Icon: Snowflake,
    aura: 'bg-sky-200/45',
    iconClass: 'text-sky-50',
    glow: 'drop-shadow-[0_0_14px_oklch(0.88_0.08_220/0.7)]',
    stroke: 2.35,
    pulse: true,
  },
  {
    Icon: Snowflake,
    aura: 'bg-gradient-to-br from-white/40 to-sky-300/35',
    iconClass: 'text-white',
    glow: 'drop-shadow-[0_0_16px_oklch(0.92_0.06_230/0.75)]',
    stroke: 2.4,
    pulse: true,
  },
]

function EpicGlyph({
  step,
  tier,
}: {
  step: EpicStep
  tier: number
}) {
  const { Icon, aura, iconClass, glow, stroke, pulse } = step

  const content = (
    <span className="relative inline-flex shrink-0 items-center justify-center">
      {aura && (
        <span
          className={cn(
            'absolute size-6 rounded-full blur-[6px]',
            aura,
            tier >= 5 && 'size-7 blur-[7px]',
            tier >= 7 && 'size-8 blur-[8px]',
          )}
          aria-hidden
        />
      )}
      <Icon
        className={cn('relative z-1', ICON, iconClass, glow)}
        strokeWidth={stroke}
      />
    </span>
  )

  if (!pulse) return content

  return (
    <motion.span
      className="inline-flex"
      animate={{ opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {content}
    </motion.span>
  )
}

/**
 * Badge de racha reutilizable.
 * Pasale `streak` (positivo o negativo) y renderiza el dibujo según los tramos
 * definidos en `lib/streaks.ts`.
 */
export function StreakBadge({
  streak,
  className,
}: {
  streak: number
  className?: string
}) {
  const tier = getStreakVisualTier(streak)
  if (tier === 0) return null

  const isHot = streak > 0
  const step = (isHot ? HOT_EPIC : COLD_EPIC)[tier - 1]

  return (
    <span
      title={`Racha ${isHot ? 'caliente' : 'fría'}: ${formatStreakValue(streak)}`}
      className={cn('inline-flex items-center', className)}
    >
      <EpicGlyph step={step} tier={tier} />
    </span>
  )
}
