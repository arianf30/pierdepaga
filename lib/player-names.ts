import type { Player } from '@/lib/data'

export function playerFullName(player: Player): string {
  return player.name.trim()
}

/** Nombre visible en ranking, desafíos y búsquedas públicas. */
export function playerPublicName(player: Player): string {
  return player.displayName?.trim() || player.name.trim()
}

export function playerShortPublicName(player: Player): string {
  return playerPublicName(player).split(' ')[0] ?? playerPublicName(player)
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/** Textos por los que se puede encontrar a un jugador. */
export function playerSearchTokens(player: Player): string[] {
  const fullName = playerFullName(player)
  const parts = fullName.split(/\s+/).filter(Boolean)

  return [
    fullName,
    player.displayName ?? '',
    player.handle,
    ...parts,
  ]
    .map(normalize)
    .filter(Boolean)
}

export function playerMatchesSearch(player: Player, query: string): boolean {
  const normalized = normalize(query)
  if (!normalized) return false
  return playerSearchTokens(player).some((token) => token.includes(normalized))
}
