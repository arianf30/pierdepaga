'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Swords } from 'lucide-react'
import type { Player } from '@/lib/data'
import { CHALLENGE_SKILL_RANGE } from '@/lib/data'
import { AccentButton, GhostButton } from '@/components/ui-kit'
import { useUser } from '@/components/auth/user-provider'
import { ProposalDateTimeField } from '@/components/challenges/proposal-datetime-field'
import {
  ClubSearchField,
  type ClubSelection,
} from '@/components/clubs/club-search-field'
import { ChallengeOpponentField } from '@/components/players/challenge-opponent-field'
import { LockedPlayerField } from '@/components/players/locked-player-field'
import { playerPublicName } from '@/lib/player-names'
import { PlayerSearchField } from '@/components/players/player-search-field'
import {
  formatProposalDateTime,
  getDefaultProposalDateTime,
  validateProposalDateTime,
} from '@/lib/proposal-scheduling'
import { formatSkill, playerSkill, SKILL_LABEL } from '@/lib/skill'
import { cn } from '@/lib/utils'

export function PierdePagaChallengeForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const { player } = useUser()
  const [teamAPartner, setTeamAPartner] = useState<Player | null>(null)
  const [opponent, setOpponent] = useState<Player | null>(null)
  const [proposal, setProposal] = useState(getDefaultProposalDateTime)
  const [club, setClub] = useState<ClubSelection | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [success, setSuccess] = useState(false)

  const teamAverage = useMemo(() => {
    if (!teamAPartner) return null
    return Math.round((playerSkill(player) + playerSkill(teamAPartner)) / 2)
  }, [player, teamAPartner])

  const proposalError = useMemo(
    () => validateProposalDateTime(proposal),
    [proposal],
  )

  useEffect(() => {
    if (!opponent || teamAverage === null) return
    const min = teamAverage - CHALLENGE_SKILL_RANGE
    const max = teamAverage + CHALLENGE_SKILL_RANGE
    if (opponent.rating < min || opponent.rating > max) {
      setOpponent(null)
    }
  }, [teamAverage, opponent])

  const errors: string[] = []
  if (submitted) {
    if (!teamAPartner) errors.push('Elegí tu compañero del equipo A.')
    if (!opponent) errors.push('Elegí al rival del equipo B.')
    if (proposalError) errors.push(proposalError)
    if (!club) errors.push('Elegí o ingresá un club.')
  }

  const canSubmit =
    teamAPartner && opponent && !proposalError && club

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setSuccess(false)

    if (!canSubmit) return

    setSuccess(true)
    setSubmitted(false)
    setTeamAPartner(null)
    setOpponent(null)
    setProposal(getDefaultProposalDateTime())
    setClub(null)

    window.setTimeout(() => {
      onSuccess?.()
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <div className="min-w-0 overflow-hidden space-y-3 rounded-2xl border border-accent/20 bg-accent/5 p-3">
          <p className="type-label text-[10px] text-accent">Equipo A</p>
          <LockedPlayerField
            label="Jugador 1"
            name={playerPublicName(player)}
            avatar={player.avatar}
            variant="accent"
          />
          <PlayerSearchField
            id="pp-team-a-2"
            label="Jugador 2"
            value={teamAPartner}
            onChange={setTeamAPartner}
            tone="accent"
            excludeIds={[
              player.id,
              ...(opponent ? [opponent.id] : []),
            ]}
          />
          <div
            className={cn(
              'rounded-xl border px-3 py-2.5',
              teamAverage !== null
                ? 'border-accent/25 bg-accent/10'
                : 'border-border bg-secondary/20',
            )}
          >
            <p className="type-label text-[10px]">Promedio {SKILL_LABEL.toLowerCase()}</p>
            <p
              className={cn(
                'font-display text-lg font-bold tabular-nums',
                teamAverage !== null ? 'text-accent' : 'text-muted-foreground',
              )}
            >
              {teamAverage !== null ? formatSkill(teamAverage) : '—'}
            </p>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden space-y-3 rounded-2xl border border-border bg-card/40 p-3">
          <p className="type-label text-[10px]">Equipo B</p>
          <ChallengeOpponentField
            id="pp-opponent"
            label="Rival"
            value={opponent}
            onChange={setOpponent}
            teamAverage={teamAverage}
            excludeIds={[
              player.id,
              ...(teamAPartner ? [teamAPartner.id] : []),
            ]}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card/40 p-3">
        <ProposalDateTimeField
          value={proposal}
          onChange={setProposal}
          error={submitted ? proposalError : null}
        />
        <ClubSearchField
          id="pp-club"
          label="Club"
          value={club}
          onChange={setClub}
          placeholder="Buscar o agregar club..."
        />
      </div>

      {canSubmit && (
        <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-xs text-muted-foreground">
          <span>{formatProposalDateTime(proposal)}</span>
          {club && <span> · {club.name}</span>}
          {opponent && (
            <span> · vs {playerPublicName(opponent)}</span>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5 text-sm text-accent">
          <CheckCircle2 className="size-4 shrink-0" />
          Desafío enviado correctamente.
        </div>
      )}

      <div className={cn('flex gap-3', !onCancel && 'block')}>
        {onCancel && (
          <GhostButton type="button" className="flex-1" onClick={onCancel}>
            Cancelar
          </GhostButton>
        )}
        <AccentButton
          type="submit"
          className={onCancel ? 'flex-1' : 'w-full'}
        >
          <Swords className="size-4" />
          Proponer desafío
        </AccentButton>
      </div>
    </form>
  )
}
