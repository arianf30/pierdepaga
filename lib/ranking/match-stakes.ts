import {
  computeMatchTransfer,
  applyLoserTransfer,
  SKILL_START,
  teamAverage,
} from '@/lib/ranking/formulas'

export type MatchSkillStakes = {
  teamAAvg: number
  teamBAvg: number
  teamASkills: [number, number]
  teamBSkills: [number, number]
  /** Puntos que se transfieren si gana A (+X ganadores A, −X perdedores B). */
  transferIfAWins: number
  /** Puntos que se transfieren si gana B (+X ganadores B, −X perdedores A). */
  transferIfBWins: number
  /** @deprecated Usar transferIfAWins */
  gainIfAWins: number
  /** @deprecated Usar −transferIfAWins */
  lossIfAWins: number
  /** @deprecated Usar transferIfBWins */
  gainIfBWins: number
  /** @deprecated Usar −transferIfBWins */
  lossIfAWinsForA: number
}

export function playerSkillOrDefault(rating: number | undefined | null): number {
  if (rating == null || !Number.isFinite(rating) || rating <= 0) {
    return SKILL_START
  }
  return rating
}

export function computeMatchSkillStakes(
  teamASkills: [number, number],
  teamBSkills: [number, number],
): MatchSkillStakes {
  const a1 = playerSkillOrDefault(teamASkills[0])
  const a2 = playerSkillOrDefault(teamASkills[1])
  const b1 = playerSkillOrDefault(teamBSkills[0])
  const b2 = playerSkillOrDefault(teamBSkills[1])

  const teamAAvg = teamAverage([a1, a2])
  const teamBAvg = teamAverage([b1, b2])

  const transferIfAWins = computeMatchTransfer(teamAAvg, teamBAvg, [b1, b2])
  const transferIfBWins = computeMatchTransfer(teamBAvg, teamAAvg, [a1, a2])

  return {
    teamAAvg: Math.round(teamAAvg * 100) / 100,
    teamBAvg: Math.round(teamBAvg * 100) / 100,
    teamASkills: [a1, a2],
    teamBSkills: [b1, b2],
    transferIfAWins,
    transferIfBWins,
    gainIfAWins: transferIfAWins,
    lossIfAWins: -transferIfAWins,
    gainIfBWins: transferIfBWins,
    lossIfAWinsForA: -transferIfBWins,
  }
}

export function formatSkillDelta(value: number): string {
  const rounded = Math.round(value)
  if (rounded > 0) return `+${rounded.toLocaleString('es-AR')}`
  return rounded.toLocaleString('es-AR')
}

export type MatchWinnerTeam = 'A' | 'B'

export type ResolvedMatchOutcome = {
  winner: MatchWinnerTeam
  loser: MatchWinnerTeam
  /** Monto nominal transferido (+X / −X simétrico). */
  transfer: number
  winnerGainPerPlayer: number
  loserLossPerPlayer: number
  teamAAvg: number
  teamBAvg: number
  /** Pérdida efectiva por jugador perdedor (respeta piso 800). */
  loserEffectiveLosses?: [number, number]
}

export function resolveStakesForWinner(
  stakes: MatchSkillStakes,
  winner: MatchWinnerTeam,
  options?: {
    loserPlayerSkills?: [number, number]
  },
): ResolvedMatchOutcome {
  const loser = winner === 'A' ? 'B' : 'A'
  const winnerAvg = winner === 'A' ? stakes.teamAAvg : stakes.teamBAvg
  const loserAvg = winner === 'A' ? stakes.teamBAvg : stakes.teamAAvg
  const loserSkills =
    options?.loserPlayerSkills ??
    (winner === 'A' ? stakes.teamBSkills : stakes.teamASkills)

  const transfer = computeMatchTransfer(winnerAvg, loserAvg, loserSkills)

  const loserEffectiveLosses: [number, number] = [
    -applyLoserTransfer(loserSkills[0], transfer),
    -applyLoserTransfer(loserSkills[1], transfer),
  ]

  return {
    winner,
    loser,
    transfer,
    winnerGainPerPlayer: transfer,
    loserLossPerPlayer: transfer > 0 ? -transfer : 0,
    teamAAvg: stakes.teamAAvg,
    teamBAvg: stakes.teamBAvg,
    loserEffectiveLosses,
  }
}

export function parseSkillInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const value = Number.parseFloat(trimmed.replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return null
  return value
}
