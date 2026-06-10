import type { Player } from '@/lib/data'

export const SKILL_LABEL = 'Habilidad'

export function formatSkill(value: number): string {
  return value.toLocaleString('es-AR')
}

export function playerSkill(player: Player): number {
  return player.rating
}
