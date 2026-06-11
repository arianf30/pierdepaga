'use client'

import { useCallback, useMemo, useState, memo } from 'react'
import { Check } from 'lucide-react'
import { MatchOutcomePanel } from '@/components/challenges/match-outcome-panel'
import { GhostButton, PrimaryButton } from '@/components/ui-kit'
import {
  computeMatchSkillStakes,
  parseSkillInput,
  resolveStakesForWinner,
  type MatchWinnerTeam,
} from '@/lib/ranking/match-stakes'
import { cn } from '@/lib/utils'

const SKILL_MIN = 500
const SKILL_MAX = 2600
const labelClass = 'type-label mb-2 block text-[11px]'

const SkillInput = memo(function SkillInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const isValid = value ? !isNaN(Number(value)) && Number(value) >= SKILL_MIN && Number(value) <= SKILL_MAX : false

  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={SKILL_MIN}
          max={SKILL_MAX}
          inputMode="numeric"
          className={cn(
            'w-full rounded-xl border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:ring-1',
            isValid
              ? 'border-primary/50 bg-primary/5 focus:border-primary focus:ring-primary/30'
              : value
                ? 'border-destructive/50 bg-destructive/5 focus:border-destructive focus:ring-destructive/30'
                : 'border-border focus:border-primary/50 focus:ring-primary/25',
          )}
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '')
            onChange(val)
          }}
          placeholder={`${SKILL_MIN}–${SKILL_MAX}`}
        />
        {isValid && (
          <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
        )}
      </div>
      {value && !isValid && (
        <p className="mt-1 text-xs text-destructive">
          Debe estar entre {SKILL_MIN} y {SKILL_MAX}
        </p>
      )}
    </div>
  )
})

const TeamBlock = memo(function TeamBlock({
  team,
  skills,
  onChange,
}: {
  team: 'A' | 'B'
  skills: [string, string]
  onChange: (index: 0 | 1, value: string) => void
}) {
  const isA = team === 'A'

  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl border p-3',
        isA
          ? 'border-primary/20 bg-primary/5'
          : 'border-border bg-card/40',
      )}
    >
      <p
        className={cn(
          'type-label text-[10px]',
          isA ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        Equipo {team}
      </p>
      <SkillInput
        id={`calc-${team}-1`}
        label="Jugador 1"
        value={skills[0]}
        onChange={(value) => onChange(0, value)}
      />
      <SkillInput
        id={`calc-${team}-2`}
        label="Jugador 2"
        value={skills[1]}
        onChange={(value) => onChange(1, value)}
      />
    </div>
  )
})

export function SkillPointsCalculator() {
  const [teamA, setTeamA] = useState<[string, string]>(['', ''])
  const [teamB, setTeamB] = useState<[string, string]>(['', ''])
  const [winner, setWinner] = useState<MatchWinnerTeam>('A')
  const [showOutcome, setShowOutcome] = useState(false)

  const updateTeamA = useCallback((index: 0 | 1, value: string) => {
    setTeamA((current) => {
      const next: [string, string] = [...current]
      next[index] = value
      return next
    })
    setShowOutcome(false)
  }, [])

  const updateTeamB = useCallback((index: 0 | 1, value: string) => {
    setTeamB((current) => {
      const next: [string, string] = [...current]
      next[index] = value
      return next
    })
    setShowOutcome(false)
  }, [])

  const allInputsFilled = useMemo(() => {
    const inputs = [teamA[0], teamA[1], teamB[0], teamB[1]].filter(Boolean)
    return (
      inputs.length >= 3 &&
      inputs.every(
        (v) => !isNaN(Number(v)) && Number(v) >= SKILL_MIN && Number(v) <= SKILL_MAX,
      )
    )
  }, [teamA, teamB])

  const parsed = useMemo(() => {
    if (!allInputsFilled) return null
    const a1 = parseSkillInput(teamA[0])
    const a2 = parseSkillInput(teamA[1])
    const b1 = parseSkillInput(teamB[0])
    const b2 = parseSkillInput(teamB[1])

    if (a1 == null || a2 == null || b1 == null || b2 == null) return null

    return computeMatchSkillStakes([a1, a2], [b1, b2])
  }, [teamA, teamB, allInputsFilled])

  const outcome = useMemo(() => {
    if (!parsed) return null

    const loserSkills =
      winner === 'A'
        ? (parsed.teamBSkills as [number, number])
        : (parsed.teamASkills as [number, number])

    return resolveStakesForWinner(parsed, winner, { loserPlayerSkills: loserSkills })
  }, [parsed, winner])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TeamBlock team="A" skills={teamA} onChange={updateTeamA} />
        <TeamBlock team="B" skills={teamB} onChange={updateTeamB} />
      </div>

      <PrimaryButton
        onClick={() => setShowOutcome(true)}
        disabled={!allInputsFilled}
        className={cn(
          'w-full',
          !allInputsFilled && 'opacity-50 cursor-not-allowed',
        )}
      >
        Calcular
      </PrimaryButton>

      {showOutcome && (
        <>
          <div>
            <p className={labelClass}>¿Quién gana?</p>
            <div className="grid grid-cols-2 gap-2">
              {(['A', 'B'] as const).map((team) => (
                <GhostButton
                  key={team}
                  type="button"
                  onClick={() => setWinner(team)}
                  className={cn(
                    'justify-center',
                    winner === team
                      ? team === 'A'
                        ? 'border-primary/40 bg-primary/15 text-primary'
                        : 'border-accent/40 bg-accent/15 text-accent'
                      : 'border-border',
                  )}
                >
                  Gana equipo {team}
                </GhostButton>
              ))}
            </div>
          </div>

          {outcome && <MatchOutcomePanel outcome={outcome} />}
        </>
      )}
    </div>
  )
}
