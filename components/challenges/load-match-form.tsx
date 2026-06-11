'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, CirclePlus } from 'lucide-react'
import type { Player } from '@/lib/data'
import { GhostButton, PrimaryButton } from '@/components/ui-kit'
import { useUser } from '@/components/auth/user-provider'
import { MatchDateTimeField } from '@/components/challenges/match-datetime-field'
import {
  ClubSearchField,
  type ClubSelection,
} from '@/components/clubs/club-search-field'
import { LockedPlayerField } from '@/components/players/locked-player-field'
import { playerPublicName } from '@/lib/player-names'
import { PlayerSearchField } from '@/components/players/player-search-field'
import {
  formatMatchDateTime,
  getDefaultMatchDateTime,
  validateMatchDateTime,
} from '@/lib/match-scheduling'
import { cn } from '@/lib/utils'
import { ScoreSelect } from '@/components/challenges/score-select'
import {
  getSetWinner,
  isValidPadelSet,
  parseSetScore,
  validateMatchScore,
  type SetScoreInput,
} from '@/lib/padel-score'

const emptySet = (): SetScoreInput => ({ teamA: '', teamB: '' })

function SetCell({
  label,
  value,
  onChange,
  disabled,
  showValidation,
  inputId,
}: {
  label: string
  value: SetScoreInput
  onChange: (next: SetScoreInput) => void
  disabled?: boolean
  showValidation?: boolean
  inputId: string
}) {
  const parsed = parseSetScore(value)
  const valid =
    parsed !== null && isValidPadelSet(parsed.teamA, parsed.teamB)
  const hasInput = value.teamA !== '' || value.teamB !== ''
  const showError = showValidation && hasInput && !valid && !disabled
  const showOk = showValidation && valid && !disabled

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-xl border p-2.5 transition-colors sm:p-3',
        disabled && 'opacity-40',
        showOk && 'border-primary/35 bg-primary/5',
        showError && 'border-destructive/40 bg-destructive/5',
        !showOk && !showError && 'border-border bg-card/40',
      )}
    >
      <p className="type-label mb-2 text-center text-[9px]">{label}</p>
      <div className="flex flex-col items-center gap-1.5">
        <ScoreSelect
          id={`${inputId}-a`}
          value={value.teamA}
          disabled={disabled}
          onChange={(teamA) => onChange({ ...value, teamA })}
          aria-label={`${label} equipo A`}
        />
        <span className="text-[10px] font-bold text-muted-foreground">–</span>
        <ScoreSelect
          id={`${inputId}-b`}
          value={value.teamB}
          disabled={disabled}
          onChange={(teamB) => onChange({ ...value, teamB })}
          aria-label={`${label} equipo B`}
        />
      </div>
    </div>
  )
}

export function LoadMatchForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const { player } = useUser()
  const [teamAPartner, setTeamAPartner] = useState<Player | null>(null)
  const [teamB, setTeamB] = useState<{
    player1: Player | null
    player2: Player | null
  }>({ player1: null, player2: null })
  const [set1, setSet1] = useState<SetScoreInput>(emptySet())
  const [set2, setSet2] = useState<SetScoreInput>(emptySet())
  const [set3, setSet3] = useState<SetScoreInput>(emptySet())
  const [matchDateTime, setMatchDateTime] = useState(getDefaultMatchDateTime)
  const [club, setClub] = useState<ClubSelection | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [success, setSuccess] = useState(false)

  const dateTimeError = useMemo(
    () => validateMatchDateTime(matchDateTime),
    [matchDateTime],
  )

  const requiresThirdSet = useMemo(() => {
    const s1 = parseSetScore(set1)
    const s2 = parseSetScore(set2)
    if (!s1 || !s2) return false
    const w1 = getSetWinner(s1)
    const w2 = getSetWinner(s2)
    if (!w1 || !w2) return false
    return w1 !== w2
  }, [set1, set2])

  const scoreValidation = useMemo(() => {
    const s1 = parseSetScore(set1)
    const s2 = parseSetScore(set2)
    const s3 = requiresThirdSet ? parseSetScore(set3) : null
    return validateMatchScore(s1, s2, s3)
  }, [set1, set2, set3, requiresThirdSet])

  const playerErrors: string[] = []
  if (submitted) {
    if (!teamAPartner) playerErrors.push('Falta tu compañero del equipo A.')
    if (!teamB.player1) playerErrors.push('Falta el jugador 1 del equipo B.')
    if (!teamB.player2) playerErrors.push('Falta el jugador 2 del equipo B.')
    if (dateTimeError) playerErrors.push(dateTimeError)
    if (!club) playerErrors.push('Elegí o ingresá un club.')
  }

  const allErrors = [...playerErrors, ...(submitted ? scoreValidation.errors : [])]
  const canSubmit =
    teamAPartner &&
    teamB.player1 &&
    teamB.player2 &&
    !dateTimeError &&
    club &&
    scoreValidation.valid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setSuccess(false)

    if (!canSubmit) return

    setSuccess(true)
    setSubmitted(false)
    setTeamAPartner(null)
    setTeamB({ player1: null, player2: null })
    setSet1(emptySet())
    setSet2(emptySet())
    setSet3(emptySet())
    setMatchDateTime(getDefaultMatchDateTime())
    setClub(null)

    window.setTimeout(() => {
      onSuccess?.()
    }, 600)
  }

  const setHint =
    parseSetScore(set1) &&
    parseSetScore(set2) &&
    getSetWinner(parseSetScore(set1)!) &&
    getSetWinner(parseSetScore(set2)!) &&
    getSetWinner(parseSetScore(set1)!) === getSetWinner(parseSetScore(set2)!)
      ? 'Partido definido en 2 sets.'
      : requiresThirdSet
        ? 'Set 3 obligatorio.'
        : 'Completá los dos primeros sets.'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
        <div className="min-w-0 overflow-hidden space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
          <p className="type-label text-[10px] text-primary">Equipo A</p>
          <LockedPlayerField
            label="Jugador 1"
            name={playerPublicName(player)}
            avatar={player.avatar}
          />
          <PlayerSearchField
            id="team-a-2"
            label="Jugador 2"
            value={teamAPartner}
            onChange={setTeamAPartner}
            excludeIds={[
              player.id,
              ...(teamB.player1 ? [teamB.player1.id] : []),
              ...(teamB.player2 ? [teamB.player2.id] : []),
            ]}
          />
        </div>

        <div className="min-w-0 overflow-hidden space-y-3 rounded-2xl border border-border bg-card/40 p-3">
          <p className="type-label text-[10px]">Equipo B</p>
          <PlayerSearchField
            id="team-b-1"
            label="Jugador 1"
            value={teamB.player1}
            onChange={(next) => setTeamB((t) => ({ ...t, player1: next }))}
            excludeIds={[
              player.id,
              ...(teamAPartner ? [teamAPartner.id] : []),
              ...(teamB.player2 ? [teamB.player2.id] : []),
            ]}
          />
          <PlayerSearchField
            id="team-b-2"
            label="Jugador 2"
            value={teamB.player2}
            onChange={(next) => setTeamB((t) => ({ ...t, player2: next }))}
            excludeIds={[
              player.id,
              ...(teamAPartner ? [teamAPartner.id] : []),
              ...(teamB.player1 ? [teamB.player1.id] : []),
            ]}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card/40 p-3">
        <MatchDateTimeField
          value={matchDateTime}
          onChange={setMatchDateTime}
          error={submitted ? dateTimeError : null}
        />
        <ClubSearchField
          id="match-club"
          label="Club"
          value={club}
          onChange={setClub}
          placeholder="Buscar o agregar club..."
        />
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-bold">Resultado</h3>
          <p className="text-[10px] text-muted-foreground">{setHint}</p>
        </div>

        <div className="flex gap-2">
          <SetCell
            label="Set 1"
            inputId="set-1"
            value={set1}
            onChange={setSet1}
            showValidation={submitted || set1.teamA !== '' || set1.teamB !== ''}
          />
          <SetCell
            label="Set 2"
            inputId="set-2"
            value={set2}
            onChange={setSet2}
            showValidation={submitted || set2.teamA !== '' || set2.teamB !== ''}
          />
          <SetCell
            label="Set 3"
            inputId="set-3"
            value={set3}
            onChange={setSet3}
            disabled={!requiresThirdSet}
            showValidation={
              requiresThirdSet &&
              (submitted || set3.teamA !== '' || set3.teamB !== '')
            }
          />
        </div>

        <p className="mt-2 text-[10px] text-muted-foreground">
          A arriba · B abajo. Válidos: 6-4, 7-5, 7-6…
        </p>
      </div>

      {scoreValidation.valid && scoreValidation.matchWinner && (
        <div className="space-y-2">
          <div className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Marcador: </span>
            <span className="font-display font-bold tabular-nums">
              {scoreValidation.formattedScore}
            </span>
            <span className="text-muted-foreground"> · Gana </span>
            <span className="font-semibold text-primary">
              Equipo {scoreValidation.matchWinner}
            </span>
          </div>
          {!dateTimeError && club && (
            <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-xs text-muted-foreground">
              <span>{formatMatchDateTime(matchDateTime)}</span>
              <span> · {club.name}</span>
            </div>
          )}
        </div>
      )}

      {allErrors.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
          {allErrors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          Partido cargado correctamente.
        </div>
      )}

      <div className={cn('flex gap-3', !onCancel && 'block')}>
        {onCancel && (
          <GhostButton type="button" className="flex-1" onClick={onCancel}>
            Cancelar
          </GhostButton>
        )}
        <PrimaryButton
          type="submit"
          className={onCancel ? 'flex-1' : 'w-full'}
        >
          <CirclePlus className="size-4" />
          Cargar partido
        </PrimaryButton>
      </div>
    </form>
  )
}
