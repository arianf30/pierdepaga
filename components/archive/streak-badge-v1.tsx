'use client'

import {
  Cloud,
  Flame,
  Snowflake,
  Sparkles,
  Sun,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStreakVisualTier } from '@/lib/streaks'

const ICON_SIZE = 'size-3.5'
const WRAPPER = 'inline-flex size-5 shrink-0 items-center justify-center rounded'

type VisualStep = {
  Icon: LucideIcon
  wrapper: string
  icon: string
}

const HOT_STEPS: VisualStep[] = [
  {
    Icon: Flame,
    wrapper: `${WRAPPER} bg-amber-500/10 text-amber-400/90`,
    icon: ICON_SIZE,
  },
  {
    Icon: Flame,
    wrapper: `${WRAPPER} bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30`,
    icon: ICON_SIZE,
  },
  {
    Icon: Zap,
    wrapper: `${WRAPPER} bg-orange-600/20 text-orange-300 ring-1 ring-orange-400/40 shadow-[0_0_10px_oklch(0.72_0.17_55/0.35)]`,
    icon: ICON_SIZE,
  },
  {
    Icon: Flame,
    wrapper: `${WRAPPER} bg-red-500/20 text-red-300 ring-1 ring-red-400/45 shadow-[0_0_12px_oklch(0.63_0.22_25/0.4)]`,
    icon: ICON_SIZE,
  },
  {
    Icon: Sun,
    wrapper: `${WRAPPER} bg-accent/20 text-accent ring-1 ring-accent/50 shadow-[0_0_14px_oklch(0.78_0.12_85/0.45)]`,
    icon: ICON_SIZE,
  },
  {
    Icon: Sun,
    wrapper: `${WRAPPER} bg-yellow-400/25 text-yellow-200 ring-1 ring-yellow-300/55 shadow-[0_0_16px_oklch(0.85_0.14_90/0.5)]`,
    icon: ICON_SIZE,
  },
  {
    Icon: Sparkles,
    wrapper: `${WRAPPER} bg-gradient-to-br from-yellow-300/30 to-orange-400/25 text-yellow-100 ring-1 ring-yellow-200/60 shadow-[0_0_18px_oklch(0.9_0.12_95/0.55)]`,
    icon: ICON_SIZE,
  },
]

const COLD_STEPS: VisualStep[] = [
  {
    Icon: Cloud,
    wrapper: `${WRAPPER} bg-sky-500/10 text-sky-300/80`,
    icon: ICON_SIZE,
  },
  {
    Icon: Snowflake,
    wrapper: `${WRAPPER} bg-cyan-500/12 text-cyan-300 ring-1 ring-cyan-500/25`,
    icon: ICON_SIZE,
  },
  {
    Icon: Snowflake,
    wrapper: `${WRAPPER} bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/35 shadow-[0_0_10px_oklch(0.62_0.14_240/0.3)]`,
    icon: ICON_SIZE,
  },
  {
    Icon: Wind,
    wrapper: `${WRAPPER} bg-blue-600/18 text-blue-200 ring-1 ring-blue-400/40 shadow-[0_0_12px_oklch(0.55_0.12_250/0.35)]`,
    icon: ICON_SIZE,
  },
  {
    Icon: Snowflake,
    wrapper: `${WRAPPER} bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-300/45 shadow-[0_0_14px_oklch(0.52_0.1_270/0.4)]`,
    icon: ICON_SIZE,
  },
  {
    Icon: Snowflake,
    wrapper: `${WRAPPER} bg-sky-200/15 text-sky-100 ring-1 ring-sky-200/50 shadow-[0_0_16px_oklch(0.88_0.06_220/0.45)]`,
    icon: ICON_SIZE,
  },
  {
    Icon: Snowflake,
    wrapper: `${WRAPPER} bg-gradient-to-br from-sky-100/20 to-blue-300/15 text-white ring-1 ring-sky-100/55 shadow-[0_0_18px_oklch(0.92_0.04_230/0.5)]`,
    icon: ICON_SIZE,
  },
]

/** Archivado: badges de racha v1 (calor/frío por tramos, tamaño fijo). */
export function StreakBadgeV1({
  streak,
  className,
}: {
  streak: number
  className?: string
}) {
  const tier = getStreakVisualTier(streak)
  if (tier === 0) return null

  const isHot = streak > 0
  const step = (isHot ? HOT_STEPS : COLD_STEPS)[tier - 1]
  const { Icon, wrapper, icon } = step

  return (
    <span
      title={`Racha ${isHot ? 'caliente' : 'fría'}: ${streak}`}
      className={cn(wrapper, className)}
    >
      <Icon className={icon} strokeWidth={tier >= 5 ? 2.25 : 2} />
    </span>
  )
}

const PREVIEW = [
  2, 3, 5, 8, 11, 14, 17, 20, -2, -3, -5, -8, -11, -14, -17, -20,
] as const

export function StreakBadgeV1Archive() {
  return (
    <div className="flex flex-wrap gap-4">
      {PREVIEW.map((s) => (
        <div
          key={s}
          className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2"
        >
          <StreakBadgeV1 streak={s} />
          <span className="font-display text-xs font-bold tabular-nums">
            {s > 0 ? `+${s}` : s}
          </span>
        </div>
      ))}
    </div>
  )
}
