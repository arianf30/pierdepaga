import type { Player } from '@/lib/data'
import type { RankingBoardEntry } from '@/lib/types/ranking'

/** "+3" / "-2" / "0" → número para ordenar y mostrar la racha. */
function parseStreak(racha: string | null): number {
  if (!racha) return 0
  const n = parseInt(racha, 10)
  return Number.isNaN(n) ? 0 : n
}

/**
 * Convierte una fila del ranking en un Player. La posición (`rank`) viene del
 * orden por score: el índice 0 (score más alto) es el puesto 1.
 */
export function mapRankingEntryToPlayer(
  entry: RankingBoardEntry,
  index: number,
  province: string,
): Player {
  const profile = entry.profile
  const fullName =
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  const displayName = profile?.display_name?.trim() || fullName || 'Jugador'

  const rank = index + 1
  // ultima_posicion guarda el puesto previo: positivo = subió, negativo = bajó.
  const rankDelta = entry.ultima_posicion ? entry.ultima_posicion - rank : 0

  return {
    id: entry.jugador_id,
    name: fullName || displayName,
    displayName,
    handle: `@${entry.jugador_id.slice(0, 8)}`,
    avatar: profile?.avatar_url || '/placeholder-user.jpg',
    rank,
    rankDelta,
    tier: '—',
    wins: entry.pg,
    losses: entry.pp,
    streak: parseStreak(entry.racha),
    rating: Number(entry.habilidad ?? 0),
    region: province,
    status: 'online',
  }
}
