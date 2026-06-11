/** Constantes y fórmulas de ranking (espejo de Postgres). */

export const SKILL_START = 1200
export const SKILL_FLOOR = 800
export const SKILL_GAIN_CAP = 70
export const SKILL_GAIN_MIN = 1
export const SKILL_LOSS_CAP = 70
export const SKILL_LOSS_FLOOR = 1
export const ELO_K = 32
export const MATCHES_VOLUME_CAP = 30
export const STREAK_NORM_CAP = 20

/** Calibración logarítmica del traslado base (todos iguales). */
export const LEVEL_TRANSFER_ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [800, 6],
  [900, 11],
  [1200, 26],
  [1400, 32],
  [1600, 45],
  [2000, 65],
]

export const UPSET_AMPLIFIER = 1.22
export const FAVORITE_DAMPENER = 0.48
export const FAVORITE_MULT_FLOOR = 0.07
export const GAP_SCALE = 400

export const COMPOSITE_WEIGHTS = {
  volume: 0.35,
  winRate: 0.3,
  skill: 0.25,
  streak: 0.1,
} as const

export const SIMPLE_MATCH_CONFIRMATIONS_REQUIRED = 3

export function eloExpected(ra: number, rb: number): number {
  return 1 / (1 + 10 ** ((rb - ra) / 400))
}

export function eloSkillDelta(
  teamAvg: number,
  oppAvg: number,
  won: boolean,
  playerSkill: number,
): number {
  const e = eloExpected(teamAvg, oppAvg)
  let delta: number

  if (won) {
    delta = ELO_K * (1 - e)
    delta = Math.min(SKILL_GAIN_CAP, Math.max(SKILL_GAIN_MIN, delta))
  } else {
    delta = ELO_K * (0 - e)
    if (playerSkill <= SKILL_FLOOR) {
      delta = Math.max(delta, -SKILL_LOSS_FLOOR)
    } else {
      delta = Math.max(delta, -SKILL_LOSS_CAP)
    }
  }

  return Math.round(delta)
}

/**
 * Traslado base según el nivel del partido (promedio de habilidad).
 * Interpolación logarítmica entre anclas calibradas.
 */
export function interpolateLevelTransfer(avgSkill: number): number {
  const avg = Math.max(SKILL_FLOOR, avgSkill)
  const anchors = LEVEL_TRANSFER_ANCHORS

  if (avg <= anchors[0][0]) return anchors[0][1]

  const last = anchors[anchors.length - 1]
  if (avg >= last[0]) {
    const ratio = Math.log(avg / last[0]) / Math.log(2400 / last[0])
    return Math.round(last[1] + ratio * 12)
  }

  for (let i = 0; i < anchors.length - 1; i += 1) {
    const [a0, t0] = anchors[i]
    const [a1, t1] = anchors[i + 1]
    if (avg >= a0 && avg <= a1) {
      const w = Math.log(avg / a0) / Math.log(a1 / a0)
      return Math.round(t0 + w * (t1 - t0))
    }
  }

  return anchors[0][1]
}

/** Multiplicador por favoritismo / sorpresa (diferencia entre equipos). */
export function matchContextMultiplier(
  winnerTeamAvg: number,
  loserTeamAvg: number,
): number {
  const diff = loserTeamAvg - winnerTeamAvg
  if (Math.abs(diff) < 20) return 1

  const gapNorm = Math.min(Math.abs(diff) / GAP_SCALE, 2.5)
  const expected = eloExpected(winnerTeamAvg, loserTeamAvg)

  if (diff > 0) {
    return 1 + UPSET_AMPLIFIER * gapNorm * (1 - expected)
  }

  return Math.max(
    FAVORITE_MULT_FLOOR,
    1 - FAVORITE_DAMPENER * gapNorm * expected,
  )
}

/** Pérdida máxima que puede absorber un perdedor sin bajar del piso. */
export function applyLoserTransfer(
  playerSkill: number,
  nominalTransfer: number,
): number {
  const maxLoss = Math.max(0, Math.round(playerSkill - SKILL_FLOOR))
  return Math.min(Math.round(nominalTransfer), maxLoss)
}

/**
 * Tope simétrico según lo que los perdedores pueden ceder.
 * En piso 800 con favorito aplastante → stake mínimo simbólico (1).
 */
export function capTransferByLosers(
  nominalTransfer: number,
  loserSkills: [number, number],
  winnerTeamAvg: number,
  loserTeamAvg: number,
): number {
  const affordable = Math.min(
    applyLoserTransfer(loserSkills[0], nominalTransfer),
    applyLoserTransfer(loserSkills[1], nominalTransfer),
  )

  if (affordable > 0) {
    return Math.min(Math.round(nominalTransfer), affordable)
  }

  if (
    winnerTeamAvg > loserTeamAvg + 300 &&
    Math.round(nominalTransfer) <= 2
  ) {
    return 1
  }

  return 0
}

/**
 * Traslado simétrico entero: ganadores +X, perdedores −X (mismo X).
 * - Nivel: escala logarítmica con el rating del partido.
 * - Contexto: amplifica upsets, reduce favoritismos.
 * - Piso: limita lo que pueden perder jugadores cerca de 800.
 */
export function computeMatchTransfer(
  winnerTeamAvg: number,
  loserTeamAvg: number,
  loserPlayerSkills?: [number, number],
): number {
  const matchAvg = (winnerTeamAvg + loserTeamAvg) / 2
  const base = interpolateLevelTransfer(matchAvg)
  const mult = matchContextMultiplier(winnerTeamAvg, loserTeamAvg)
  let transfer = Math.round(base * mult)
  transfer = Math.min(SKILL_GAIN_CAP, Math.max(SKILL_GAIN_MIN, transfer))

  if (loserPlayerSkills) {
    transfer = capTransferByLosers(
      transfer,
      loserPlayerSkills,
      winnerTeamAvg,
      loserTeamAvg,
    )
  }

  return transfer
}

export function applySkillDelta(currentSkill: number, delta: number): number {
  return Math.max(SKILL_FLOOR, Math.round(currentSkill + delta))
}

export function updateStreak(current: number, won: boolean): number {
  if (won) return current >= 0 ? current + 1 : 1
  return current <= 0 ? current - 1 : -1
}

export function computeCompositeScore(
  matchesPlayed: number,
  wins: number,
  skillRating: number,
  streak: number,
): number {
  const normVol = Math.min(matchesPlayed / MATCHES_VOLUME_CAP, 1)
  const normWr = (wins + 5) / (matchesPlayed + 10)
  const normSkill = Math.max(
    0,
    Math.min(1, (skillRating - SKILL_FLOOR) / 2000),
  )
  const normStreak = Math.min(Math.max(streak, 0) / STREAK_NORM_CAP, 1)

  const score =
    COMPOSITE_WEIGHTS.volume * normVol +
    COMPOSITE_WEIGHTS.winRate * normWr +
    COMPOSITE_WEIGHTS.skill * normSkill +
    COMPOSITE_WEIGHTS.streak * normStreak

  return Math.round(score * 1_000_000) / 1_000_000
}

export function teamAverage(skills: number[]): number {
  if (skills.length === 0) return SKILL_START
  return skills.reduce((a, b) => a + b, 0) / skills.length
}
