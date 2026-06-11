export type SetScore = {
  teamA: number
  teamB: number
}

export type SetScoreInput = {
  teamA: string
  teamB: string
}

export const PADEL_SET_SCORES = [0, 1, 2, 3, 4, 5, 6, 7] as const

/** Un set válido de pádel: 6-x (x≤4), 7-5 o 7-6 (y simétricos). */
export function isValidPadelSet(teamA: number, teamB: number): boolean {
  if (!Number.isInteger(teamA) || !Number.isInteger(teamB)) return false
  if (teamA < 0 || teamB < 0 || teamA > 7 || teamB > 7) return false
  if (teamA === teamB) return false

  const [winner, loser] = teamA > teamB ? [teamA, teamB] : [teamB, teamA]

  if (winner === 6) return loser <= 4
  if (winner === 7) return loser === 5 || loser === 6

  return false
}

export function parseSetScore(input: SetScoreInput): SetScore | null {
  if (input.teamA.trim() === '' || input.teamB.trim() === '') return null

  const teamA = Number.parseInt(input.teamA, 10)
  const teamB = Number.parseInt(input.teamB, 10)

  if (Number.isNaN(teamA) || Number.isNaN(teamB)) return null
  return { teamA, teamB }
}

export function getSetWinner(
  score: SetScore,
): 'A' | 'B' | null {
  if (!isValidPadelSet(score.teamA, score.teamB)) return null
  if (score.teamA > score.teamB) return 'A'
  if (score.teamB > score.teamA) return 'B'
  return null
}

export function formatSetScore(score: SetScore): string {
  return `${score.teamA}-${score.teamB}`
}

export function formatMatchScore(sets: SetScore[]): string {
  return sets.map(formatSetScore).join(' ')
}

export type MatchScoreValidation = {
  valid: boolean
  errors: string[]
  requiresThirdSet: boolean
  matchWinner: 'A' | 'B' | null
  sets: SetScore[]
  formattedScore: string
}

export function validateMatchScore(
  set1: SetScore | null,
  set2: SetScore | null,
  set3: SetScore | null,
): MatchScoreValidation {
  const errors: string[] = []
  const sets: SetScore[] = []

  if (!set1) {
    errors.push('Completá el primer set.')
  } else if (!isValidPadelSet(set1.teamA, set1.teamB)) {
    errors.push(
      'Set 1 inválido. Usá marcadores como 6-4, 7-5 o 7-6.',
    )
  } else {
    sets.push(set1)
  }

  if (!set2) {
    errors.push('Completá el segundo set.')
  } else if (!isValidPadelSet(set2.teamA, set2.teamB)) {
    errors.push(
      'Set 2 inválido. Usá marcadores como 6-4, 7-5 o 7-6.',
    )
  } else if (set1 && isValidPadelSet(set1.teamA, set1.teamB)) {
    sets.push(set2)
  }

  const w1 = set1 ? getSetWinner(set1) : null
  const w2 = set2 ? getSetWinner(set2) : null

  if (!w1 || !w2) {
    return {
      valid: false,
      errors,
      requiresThirdSet: false,
      matchWinner: null,
      sets,
      formattedScore: '',
    }
  }

  const requiresThirdSet = w1 !== w2

  if (!requiresThirdSet) {
    if (set3) {
      errors.push(
        'Con 2 sets ganados por el mismo equipo no hace falta el tercero.',
      )
    }

    const matchWinner = w1
    const finalSets = sets.slice(0, 2)

    return {
      valid: errors.length === 0,
      errors,
      requiresThirdSet: false,
      matchWinner,
      sets: finalSets,
      formattedScore: formatMatchScore(finalSets),
    }
  }

  if (!set3) {
    errors.push('Van 1-1 en sets: tenés que cargar el tercero.')
    return {
      valid: false,
      errors,
      requiresThirdSet: true,
      matchWinner: null,
      sets,
      formattedScore: '',
    }
  }

  if (!isValidPadelSet(set3.teamA, set3.teamB)) {
    errors.push(
      'Set 3 inválido. Usá marcadores como 6-4, 7-5 o 7-6.',
    )
    return {
      valid: false,
      errors,
      requiresThirdSet: true,
      matchWinner: null,
      sets,
      formattedScore: '',
    }
  }

  const w3 = getSetWinner(set3)!
  const finalSets = [...sets.slice(0, 2), set3]

  return {
    valid: errors.length === 0,
    errors,
    requiresThirdSet: true,
    matchWinner: w3,
    sets: finalSets,
    formattedScore: formatMatchScore(finalSets),
  }
}
