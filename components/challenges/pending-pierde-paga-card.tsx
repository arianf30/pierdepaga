'use client'

import { Check, Clock, MapPin, Swords, UserPlus, X } from 'lucide-react'
import {
  CHALLENGE_SKILL_RANGE,
  teamLabel,
  type Player,
} from '@/lib/data'
import {
  getPierdePagaChallengeStatus,
  pierdePagaChallengeActions,
  pierdePagaTeamAverage,
  statusToneClasses,
  type PendingPierdePagaChallenge,
} from '@/lib/pending-activities'
import {
  AccentButton,
  GhostButton,
  SecondaryButton,
} from '@/components/ui-kit'
import { formatSkill } from '@/lib/skill'
import { cn } from '@/lib/utils'

function ChallengeTeam({
  label,
  players,
  align = 'start',
  accent,
}: {
  label: string
  players: (Player | null)[]
  align?: 'start' | 'end'
  accent?: boolean
}) {
  const isEnd = align === 'end'
  const filled = players.filter(Boolean) as Player[]

  return (
    <div className={cn('min-w-0 flex-1', isEnd && 'text-right')}>
      <p
        className={cn(
          'type-label mb-1.5 text-[9px]',
          accent && 'text-accent',
        )}
      >
        {label}
      </p>
      <div
        className={cn(
          'inline-flex items-center',
          isEnd && 'flex-row-reverse',
        )}
      >
        {players.map((player, i) =>
          player ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={player.id}
              src={player.avatar || '/placeholder.svg'}
              alt=""
              className={cn(
                'rounded-lg object-cover ring-2 ring-card',
                'size-9',
                i > 0 && (isEnd ? '-mr-2.5' : '-ml-2.5'),
                accent && 'ring-accent/35',
              )}
            />
          ) : (
            <div
              key={`empty-${i}`}
              className={cn(
                'grid size-9 place-items-center rounded-lg border border-dashed border-border bg-secondary/20 text-muted-foreground/50',
                i > 0 && (isEnd ? '-mr-2.5' : '-ml-2.5'),
              )}
            >
              <UserPlus className="size-3.5" />
            </div>
          ),
        )}
      </div>
      <p className="mt-1.5 text-xs font-semibold leading-tight">
        {filled.length === 0
          ? 'Por definir'
          : filled.length === 1
            ? filled[0].name.split(' ')[0]
            : teamLabel(filled as [Player, Player])}
      </p>
    </div>
  )
}

export function PendingPierdePagaCard({
  challenge,
  userId,
  onConfirmPartner,
  onPickPartner,
  onCancel,
}: {
  challenge: PendingPierdePagaChallenge
  userId: string
  onConfirmPartner?: (id: string) => void
  onPickPartner?: (id: string) => void
  onCancel?: (id: string) => void
}) {
  const status = getPierdePagaChallengeStatus(challenge, userId)
  const actions = pierdePagaChallengeActions(challenge, userId)
  const teamAvg = pierdePagaTeamAverage(challenge)

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border bg-card/60',
        'border-accent/20',
      )}
    >
      <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

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
            <span className="type-badge rounded-md bg-accent/15 px-2 py-0.5 text-[9px] text-accent">
              Pierde paga
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            {challenge.proposedAt}
            <span className="text-border">·</span>
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{challenge.club}</span>
          </p>
          {status.detail && (
            <p className="mt-1 text-[11px] text-muted-foreground">{status.detail}</p>
          )}
        </div>
        <span className="shrink-0 font-display text-sm font-black tabular-nums text-accent text-glow-gold">
          {challenge.stake}
        </span>
      </div>

      <div className="flex items-center gap-2 px-4 py-4">
        <ChallengeTeam
          label="Equipo A"
          players={[challenge.challenger, challenge.challengerPartner]}
          accent
        />
        <div className="flex shrink-0 flex-col items-center gap-1 px-1">
          <span className="font-display text-[10px] font-black tracking-[0.2em] text-muted-foreground/45">
            VS
          </span>
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-accent/25 to-transparent" />
        </div>
        <ChallengeTeam
          label="Equipo B"
          players={[
            challenge.challenged,
            challenge.challengedPartner,
          ]}
          align="end"
          accent={challenge.step === 'ready'}
        />
      </div>

      <div className="space-y-3 border-t border-border/50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-0.5',
              challenge.challengerPartnerConfirmed
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border bg-secondary/30',
            )}
          >
            {challenge.challengerPartnerConfirmed ? (
              <Check className="size-3" />
            ) : (
              <Clock className="size-3 opacity-60" />
            )}
            Compañero A
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-0.5',
              challenge.challengedPartner
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border bg-secondary/30',
            )}
          >
            {challenge.challengedPartner ? (
              <Check className="size-3" />
            ) : (
              <Clock className="size-3 opacity-60" />
            )}
            Compañero B
          </span>
          <span className="text-border">·</span>
          <span>
            Prom. A: {formatSkill(teamAvg)} · rango rival ±{CHALLENGE_SKILL_RANGE}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.canConfirmPartner && (
            <AccentButton
              type="button"
              className="flex-1 py-2.5 text-xs sm:flex-none"
              onClick={() => onConfirmPartner?.(challenge.id)}
            >
              <Check className="size-3.5" />
              Confirmar desafío
            </AccentButton>
          )}
          {actions.canPickPartner && (
            <AccentButton
              type="button"
              className="flex-1 py-2.5 text-xs sm:flex-none"
              onClick={() => onPickPartner?.(challenge.id)}
            >
              <UserPlus className="size-3.5" />
              Elegir compañero
            </AccentButton>
          )}
          {actions.canCancel && (
            <GhostButton
              type="button"
              className="flex-1 py-2.5 text-xs text-destructive hover:border-destructive/40 hover:text-destructive sm:flex-none"
              onClick={() => onCancel?.(challenge.id)}
            >
              <X className="size-3.5" />
              Cancelar desafío
            </GhostButton>
          )}
          {challenge.step === 'ready' && (
            <SecondaryButton
              type="button"
              className="flex-1 py-2.5 text-xs sm:flex-none"
              disabled
            >
              <Swords className="size-3.5" />
              Listo para jugar
            </SecondaryButton>
          )}
        </div>
      </div>
    </article>
  )
}
