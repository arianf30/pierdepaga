import type { Player } from '@/lib/data'
import type { RankingLeaderboardEntry } from '@/lib/types/game'

export function mapLeaderboardEntryToPlayer(
  entry: RankingLeaderboardEntry,
  province: string,
): Player {
  const profile = entry.profile
  const fullName =
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  const displayName = profile?.display_name?.trim() || fullName || 'Jugador'

  return {
    id: entry.player_id,
    name: fullName || displayName,
    displayName,
    handle: `@${entry.player_id.slice(0, 8)}`,
    avatar: profile?.avatar_url || '/placeholder-user.jpg',
    rank: entry.rank_position ?? 0,
    rankDelta: entry.rank_delta,
    tier: '—',
    wins: entry.wins,
    losses: entry.losses,
    streak: entry.streak,
    rating: Number(entry.skill_rating),
    region: province,
    status: 'online',
  }
}

export function mapProfileSearchToPlayer(
  row: {
    id: string
    first_name: string
    last_name: string
    display_name: string
    avatar_url: string | null
    ranking?: {
      rank_position: number | null
      skill_rating: number
      wins: number
      losses: number
      streak: number
      rank_delta: number
    } | null
  },
  province: string,
): Player {
  const fullName = `${row.first_name} ${row.last_name}`.trim()
  const displayName = row.display_name.trim() || fullName || 'Jugador'
  const ranking = row.ranking

  return {
    id: row.id,
    name: fullName || displayName,
    displayName,
    handle: `@${row.id.slice(0, 8)}`,
    avatar: row.avatar_url || '/placeholder-user.jpg',
    rank: ranking?.rank_position ?? 0,
    rankDelta: ranking?.rank_delta ?? 0,
    tier: '—',
    wins: ranking?.wins ?? 0,
    losses: ranking?.losses ?? 0,
    streak: ranking?.streak ?? 0,
    rating: Number(ranking?.skill_rating ?? 1200),
    region: province,
    status: 'online',
  }
}

export function mergePlayerWithRanking(
  base: Player,
  ranking: RankingLeaderboardEntry | null | undefined,
): Player {
  if (!ranking) return base

  return {
    ...base,
    rank: ranking.rank_position ?? 0,
    rankDelta: ranking.rank_delta,
    wins: ranking.wins,
    losses: ranking.losses,
    streak: ranking.streak,
    rating: Number(ranking.skill_rating),
  }
}
