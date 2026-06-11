'use client'

import { useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'
import { MatchOutcomePanel } from '@/components/challenges/match-outcome-panel'
import { GhostButton } from '@/components/ui-kit'
import { SKILL_START } from '@/lib/ranking/formulas'
import {
  computeMatchSkillStakes,
  parseSkillInput,
  resolveStakesForWinner,
  type MatchWinnerTeam,
} from '@/lib/ranking/match-stakes'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/25'

const labelClass = 'type-label mb-1.5 block text-[11px]'

function SkillField({
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
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={1}
        inputMode="decimal"
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={String(SKILL_START)}
      />
    </div>
  )
}

function TeamBlock({
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
      <SkillField
        id={`calc-${team}-1`}
        label="Jugador 1"
        value={skills[0]}
        onChange={(value) => onChange(0, value)}
      />
      <SkillField
        id={`calc-${team}-2`}
        label="Jugador 2"
        value={skills[1]}
        onChange={(value) => onChange(1, value)}
      />
    </div>
  )
}

export function SkillPointsCalculator() {
  const [teamA, setTeamA] = useState<[string, string]>(['', ''])
  const [teamB, setTeamB] = useState<[string, string]>(['', ''])
  const [winner, setWinner] = useState<MatchWinnerTeam>('A')

  const parsed = useMemo(() => {
    const a1 = parseSkillInput(teamA[0])
    const a2 = parseSkillInput(teamA[1])
    const b1 = parseSkillInput(teamB[0])
    const b2 = parseSkillInput(teamB[1])

    if (a1 == null || a2 == null || b1 == null || b2 == null) return null

    return computeMatchSkillStakes([a1, a2], [b1, b2])
  }, [teamA, teamB])

  const outcome = useMemo(() => {
    if (!parsed) return null

    const loserSkills =
      winner === 'A'
        ? (parsed.teamBSkills as [number, number])
        : (parsed.teamASkills as [number, number])

    return resolveStakesForWinner(parsed, winner, { loserPlayerSkills: loserSkills })
  }, [parsed, winner])

  function updateTeamA(index: 0 | 1, value: string) {
    setTeamA((current) => {
      const next: [string, string] = [...current]
      next[index] = value
      return next
    })
  }

  function updateTeamB(index: 0 | 1, value: string) {
    setTeamB((current) => {
      const next: [string, string] = [...current]
      next[index] = value
      return next
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TeamBlock team="A" skills={teamA} onChange={updateTeamA} />
        <TeamBlock team="B" skills={teamB} onChange={updateTeamB} />
      </div>

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

      {outcome ? (
        <MatchOutcomePanel outcome={outcome} />
      ) : (
        <p className="rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-muted-foreground">
          Completá los 4 puntos de habilidad para ver el resultado.
        </p>
      )}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Calculator className="mt-0.5 size-3.5 shrink-0" />
        Usa la misma fórmula que al confirmar un partido: un solo monto
        transferido según la diferencia de habilidad (piso 800).
      </p>
    </div>
  )
}
