'use client'

import { Check, Clock, MapPin, X } from 'lucide-react'
import { teamLabel } from '@/lib/data'
import { playerPublicName } from '@/lib/player-names'
import {
  allPlayersInSimpleMatch,
  getSimpleMatchStatus,
  isSimpleMatchConfirmed,
  simpleMatchActions,
  simpleMatchConfirmationCount,
  statusToneClasses,
  type PendingSimpleMatch,
  userConfirmedSimpleMatch,
} from '@/lib/pending-activities'
import { GhostButton, PrimaryButton } from '@/components/ui-kit'
import { SkillStakesPanel } from '@/components/challenges/skill-stakes-panel'
import { cn } from '@/lib/utils'

function ConfirmationRow({
  match,
  userId,
}: {
  match: PendingSimpleMatch
  userId: string
}) {
  const players = allPlayersInSimpleMatch(match)

  return (
    <div className="flex flex-wrap gap-1.5">
      {players.map((player) => {
        const confirmed = userConfirmedSimpleMatch(match, player.id)
        const isMe = player.id === userId

        return (
          <span
            key={player.id}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium',
              confirmed
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border bg-secondary/30 text-muted-foreground',
            )}
          >
            {confirmed ? (
              <Check className="size-3 shrink-0" />
            ) : (
              <Clock className="size-3 shrink-0 opacity-60" />
            )}
            {isMe ? 'Vos' : playerPublicName(player).split(' ')[0]}
          </span>
        )
      })}
    </div>
  )
}

export function PendingSimpleMatchCard({
  match,
  userId,
  onConfirm,
  onCancel,
}: {
  match: PendingSimpleMatch
  userId: string
  onConfirm?: (id: string) => void
  onCancel?: (id: string) => void
}) {
  const status = getSimpleMatchStatus(match, userId)
  const actions = simpleMatchActions(match, userId)
  const count = simpleMatchConfirmationCount(match)
  const confirmed = isSimpleMatchConfirmed(match)
  const winnerA = match.winnerTeam === 'A'

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'type-badge rounded-md border px-2 py-0.5 text-[9px]',
                statusToneClasses[status.tone],
              )}
            >
              {status.label}
            </span>
            <span className="type-badge rounded-md bg-primary/10 px-2 py-0.5 text-[9px] text-primary">
              Partido simple
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            {match.playedAt}
            <span className="text-border">·</span>
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{match.club}</span>
          </p>
          {status.detail && (
            <p className="mt-1 text-[11px] text-muted-foreground">{status.detail}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-black tabular-nums tracking-tight text-foreground">
            {match.score}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {count}/4 confirmaron
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-4">
        <div className={cn('min-w-0', winnerA && 'text-primary')}>
          <p className="type-label mb-1.5 text-[9px]">Equipo A</p>
          <div className="flex items-center gap-2">
            {match.teamA.map((player, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={player.id}
                src={player.avatar || '/placeholder.svg'}
                alt=""
                className={cn(
                  'rounded-lg object-cover ring-2 ring-card',
                  'size-9',
                  i === 1 && '-ml-2.5',
                  winnerA && 'ring-primary/35',
                )}
              />
            ))}
          </div>
          <p
            className={cn(
              'mt-1.5 text-xs font-semibold',
              winnerA && 'text-glow-energy',
            )}
          >
            {teamLabel(match.teamA)}
            {winnerA && ' · Ganador'}
          </p>
        </div>

        <span className="px-1 text-[10px] font-bold text-muted-foreground/50">
          vs
        </span>

        <div
          className={cn(
            'min-w-0 text-right',
            !winnerA && 'text-primary',
          )}
        >
          <p className="type-label mb-1.5 text-[9px]">Equipo B</p>
          <div className="flex items-center justify-end gap-2">
            {match.teamB.map((player, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={player.id}
                src={player.avatar || '/placeholder.svg'}
                alt=""
                className={cn(
                  'rounded-lg object-cover ring-2 ring-card',
                  'size-9',
                  i === 1 && '-mr-2.5',
                  !winnerA && 'ring-primary/35',
                )}
              />
            ))}
          </div>
          <p
            className={cn(
              'mt-1.5 text-xs font-semibold',
              !winnerA && 'text-glow-energy',
            )}
          >
            {teamLabel(match.teamB)}
            {!winnerA && ' · Ganador'}
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-border/50 px-4 py-3">
        {match.skillStakes && (
          <SkillStakesPanel stakes={match.skillStakes} className="border-border/60 bg-card/40" />
        )}
        <ConfirmationRow match={match} userId={userId} />

        {(actions.canConfirm || actions.canCancel) && (
          <div className="flex flex-wrap gap-2">
            {actions.canConfirm && (
              <PrimaryButton
                type="button"
                className="flex-1 py-2.5 text-xs sm:flex-none"
                onClick={() => onConfirm?.(match.id)}
              >
                <Check className="size-3.5" />
                Confirmar resultado
              </PrimaryButton>
            )}
            {actions.canCancel && (
              <GhostButton
                type="button"
                className="flex-1 py-2.5 text-xs text-destructive hover:border-destructive/40 hover:text-destructive sm:flex-none"
                onClick={() => onCancel?.(match.id)}
              >
                <X className="size-3.5" />
                Cancelar partido
              </GhostButton>
            )}
          </div>
        )}

        {confirmed && (
          <p className="text-[11px] text-primary">
            Resultado validado · se publicará en el feed cuando el cuarto jugador confirme o expire el plazo.
          </p>
        )}
      </div>
    </article>
  )
}
