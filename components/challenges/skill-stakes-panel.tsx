'use client'

import { Swords } from 'lucide-react'
import type { MatchSkillStakes } from '@/lib/ranking/match-stakes'
import { formatSkillDelta } from '@/lib/ranking/match-stakes'
import { formatSkill } from '@/lib/skill'
import { cn } from '@/lib/utils'

export function SkillStakesPanel({
  stakes,
  loading = false,
  className,
}: {
  stakes: MatchSkillStakes | null
  loading?: boolean
  className?: string
}) {
  if (!stakes && !loading) return null

  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Swords className="size-4 text-primary" />
        <p className="type-kicker text-primary">Habilidad en juego</p>
      </div>

      {loading && !stakes ? (
        <p className="text-sm text-muted-foreground">Calculando habilidad…</p>
      ) : stakes ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card/50 px-3 py-2.5">
              <p className="type-label text-[9px]">Equipo A · promedio</p>
              <p className="font-display text-lg font-bold tabular-nums text-foreground">
                {formatSkill(stakes.teamAAvg)}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/50 px-3 py-2.5">
              <p className="type-label text-[9px]">Equipo B · promedio</p>
              <p className="font-display text-lg font-bold tabular-nums text-foreground">
                {formatSkill(stakes.teamBAvg)}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="rounded-xl border border-border/50 bg-background/40 px-3 py-2.5">
              <span className="font-semibold text-primary">Si gana A:</span>{' '}
              <span className="tabular-nums text-primary">
                {formatSkillDelta(stakes.transferIfAWins)}
              </span>{' '}
              para A ·{' '}
              <span className="tabular-nums text-destructive">
                {formatSkillDelta(-stakes.transferIfAWins)}
              </span>{' '}
              para B
            </p>
            <p className="rounded-xl border border-border/50 bg-background/40 px-3 py-2.5">
              <span className="font-semibold text-primary">Si gana B:</span>{' '}
              <span className="tabular-nums text-primary">
                {formatSkillDelta(stakes.transferIfBWins)}
              </span>{' '}
              para B ·{' '}
              <span className="tabular-nums text-destructive">
                {formatSkillDelta(-stakes.transferIfBWins)}
              </span>{' '}
              para A
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Mismo monto transferido: lo que gana un equipo se resta del otro.
            Cerca de 800 pts la pérdida se reduce.
          </p>
        </>
      ) : null}
    </div>
  )
}
