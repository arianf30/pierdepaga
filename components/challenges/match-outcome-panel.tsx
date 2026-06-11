'use client'

import type { ResolvedMatchOutcome } from '@/lib/ranking/match-stakes'
import { formatSkillDelta } from '@/lib/ranking/match-stakes'
import { formatSkill } from '@/lib/skill'
import { cn } from '@/lib/utils'

function formatEffectiveLoss(value: number): string {
  return formatSkillDelta(value)
}

export function MatchOutcomePanel({
  outcome,
  className,
}: {
  outcome: ResolvedMatchOutcome
  className?: string
}) {
  const hasEffectiveLosses =
    outcome.loserEffectiveLosses &&
    (outcome.loserEffectiveLosses[0] !== outcome.loserLossPerPlayer ||
      outcome.loserEffectiveLosses[1] !== outcome.loserLossPerPlayer)

  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4',
        className,
      )}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/50 px-3 py-2.5">
          <p className="type-label text-[9px]">Equipo A · promedio</p>
          <p className="font-display text-lg font-bold tabular-nums text-foreground">
            {formatSkill(outcome.teamAAvg)}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/50 px-3 py-2.5">
          <p className="type-label text-[9px]">Equipo B · promedio</p>
          <p className="font-display text-lg font-bold tabular-nums text-foreground">
            {formatSkill(outcome.teamBAvg)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-sm">
        <p className="type-label mb-2 text-[9px] text-primary">
          Resultado · gana equipo {outcome.winner}
        </p>
        <p className="text-muted-foreground">
          Se transfieren{' '}
          <span className="font-semibold tabular-nums text-foreground">
            {formatSkill(outcome.transfer)}
          </span>{' '}
          puntos por jugador.
        </p>
        <p className="mt-2">
          <span className="font-semibold text-primary">Equipo {outcome.winner}:</span>{' '}
          <span className="tabular-nums text-primary">
            {formatSkillDelta(outcome.winnerGainPerPlayer)}
          </span>{' '}
          c/u
        </p>
        <p className="mt-1.5">
          <span className="font-semibold text-destructive">
            Equipo {outcome.loser}:
          </span>{' '}
          <span className="tabular-nums text-destructive">
            {formatSkillDelta(outcome.loserLossPerPlayer)}
          </span>{' '}
          c/u
        </p>
        {hasEffectiveLosses && outcome.loserEffectiveLosses && (
          <p className="mt-2 text-xs text-muted-foreground">
            Con piso 800: jugador 1{' '}
            {formatEffectiveLoss(outcome.loserEffectiveLosses[0])} · jugador 2{' '}
            {formatEffectiveLoss(outcome.loserEffectiveLosses[1])}
          </p>
        )}
        {outcome.transfer > 0 &&
          outcome.loserEffectiveLosses &&
          outcome.loserEffectiveLosses.every((v) => v === 0) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Los perdedores están en el piso 800 y no pueden ceder más puntos.
            </p>
          )}
      </div>
    </div>
  )
}
