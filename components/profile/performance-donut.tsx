'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type PerformanceDonutProps = {
  setsWon: number
  setsLost: number
  gamesWon: number
  gamesLost: number
  className?: string
}

function DonutRing({
  won,
  lost,
  size = 168,
  strokeWidth = 16,
  wonClassName = 'text-primary',
  trackClassName = 'text-destructive/25',
}: {
  won: number
  lost: number
  size?: number
  strokeWidth?: number
  wonClassName?: string
  trackClassName?: string
}) {
  const total = won + lost
  const rate = total > 0 ? Math.round((won / total) * 100) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const wonLength = total > 0 ? (won / total) * circumference : 0
  const center = size / 2

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClassName}
          stroke="currentColor"
        />
        {wonLength > 0 && (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={wonClassName}
            stroke="currentColor"
            strokeDasharray={`${wonLength} ${circumference - wonLength}`}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${wonLength} ${circumference - wonLength}` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-display text-4xl font-black tabular-nums text-foreground">
          {rate}%
        </p>
        <p className="type-label mt-0.5 text-[10px]">Win rate</p>
      </div>
    </div>
  )
}

function LegendRow({
  label,
  won,
  lost,
}: {
  label: string
  won: number
  lost: number
}) {
  const total = won + lost
  const rate = total > 0 ? Math.round((won / total) * 100) : 0

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/20 px-3 py-2.5">
      <p className="type-label text-[10px]">{label}</p>
      <div className="flex items-center gap-3 text-xs tabular-nums">
        <span className="font-semibold text-primary">{won} G</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="font-semibold text-destructive">{lost} P</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="font-display font-bold text-accent">{rate}%</span>
      </div>
    </div>
  )
}

export function PerformanceDonut({
  setsWon,
  setsLost,
  gamesWon,
  gamesLost,
  className,
}: PerformanceDonutProps) {
  const totalWon = setsWon + gamesWon
  const totalLost = setsLost + gamesLost

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card/60 p-5 sm:p-6',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
        <div className="relative shrink-0">
          <DonutRing won={totalWon} lost={totalLost} />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-primary/10" />
        </div>

        <div className="w-full min-w-0 flex-1 space-y-4">
          <div>
            <p className="type-kicker">Rendimiento</p>
            <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
              Sets y games
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ganados vs perdidos en el historial del jugador
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary" />
              Ganados
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-destructive/50" />
              Perdidos
            </span>
          </div>

          <div className="space-y-2">
            <LegendRow label="Sets" won={setsWon} lost={setsLost} />
            <LegendRow label="Games" won={gamesWon} lost={gamesLost} />
          </div>
        </div>
      </div>
    </div>
  )
}
