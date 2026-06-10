/** Umbrales de racha positiva (premios, visual, etc.). */
export const POSITIVE_STREAK_MILESTONES = [3, 5, 8, 11, 14, 17, 20] as const

/** Umbrales de racha negativa (misma escala, valores negativos). */
export const NEGATIVE_STREAK_MILESTONES = POSITIVE_STREAK_MILESTONES.map(
  (n) => -n,
) as readonly [-3, -5, -8, -11, -14, -17, -20]

export type StreakMilestone = (typeof POSITIVE_STREAK_MILESTONES)[number]

export type StreakVisualTier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Nivel visual según tramos de las constantes:
 * 0 → sin dibujo (+1/+2 o -1/-2)
 * 1 → +3/+4 · 2 → +5/+6/+7 · 3 → +8/+9/+10 … 7 → +20+
 */
export function getStreakVisualTier(streak: number): StreakVisualTier {
  if (streak === 0) return 0
  const abs = Math.abs(streak)
  if (abs < POSITIVE_STREAK_MILESTONES[0]) return 0

  let tier: StreakVisualTier = 0
  for (let i = 0; i < POSITIVE_STREAK_MILESTONES.length; i++) {
    if (abs >= POSITIVE_STREAK_MILESTONES[i]) {
      tier = (i + 1) as StreakVisualTier
    }
  }
  return tier
}

/** @deprecated Usar getStreakVisualTier */
export function getStreakTier(streak: number): number {
  const tier = getStreakVisualTier(streak)
  return streak > 0 ? tier : -tier
}

export function reachedStreakMilestone(streak: number): number | null {
  if (streak === 0) return null
  const milestones =
    streak > 0 ? POSITIVE_STREAK_MILESTONES : NEGATIVE_STREAK_MILESTONES
  const abs = Math.abs(streak)
  let hit: number | null = null
  for (const m of milestones) {
    if (abs >= Math.abs(m)) hit = m
  }
  return hit
}

export function nextStreakMilestone(streak: number): number | null {
  if (streak >= 0) {
    return POSITIVE_STREAK_MILESTONES.find((m) => m > streak) ?? null
  }
  const abs = Math.abs(streak)
  const next = NEGATIVE_STREAK_MILESTONES.find((m) => Math.abs(m) > abs)
  return next ?? null
}

export function formatStreakValue(streak: number): string {
  if (streak > 0) return `+${streak}`
  return String(streak)
}
