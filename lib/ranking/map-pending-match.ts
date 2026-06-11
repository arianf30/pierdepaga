import type { Player } from '@/lib/data'
import type {
  MatchParticipantRow,
  MatchRow,
} from '@/lib/types/game'
import type { PendingSimpleMatch } from '@/lib/pending-activities'
import { formatPlayedAt } from '@/lib/match-scheduling'

type ParticipantWithProfile = MatchParticipantRow & {
  profiles: {
    id: string
    first_name: string
    last_name: string
    display_name: string
    avatar_url: string | null
  } | null
}

export type PendingMatchBundle = {
  match: MatchRow
  participants: ParticipantWithProfile[]
}

function profileToPlayer(
  profile: NonNullable<ParticipantWithProfile['profiles']>,
  province: string,
): Player {
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const displayName = profile.display_name.trim() || fullName || 'Jugador'

  return {
    id: profile.id,
    name: fullName || displayName,
    displayName,
    handle: `@${profile.id.slice(0, 8)}`,
    avatar: profile.avatar_url || '/placeholder-user.jpg',
    rank: 0,
    rankDelta: 0,
    tier: '—',
    wins: 0,
    losses: 0,
    streak: 0,
    rating: 1200,
    region: province,
    status: 'online',
  }
}

export function mapPendingMatchBundle(
  bundle: PendingMatchBundle,
  province: string,
  sortOrder: number,
): PendingSimpleMatch | null {
  const { match, participants } = bundle
  if (participants.length !== 4) return null

  const teamA = participants
    .filter((p) => p.team === 'A')
    .sort((a, b) => a.slot - b.slot)
  const teamB = participants
    .filter((p) => p.team === 'B')
    .sort((a, b) => a.slot - b.slot)

  if (teamA.length !== 2 || teamB.length !== 2) return null

  const toPlayer = (p: ParticipantWithProfile) => {
    if (!p.profiles) {
      return {
        id: p.player_id,
        name: 'Jugador',
        displayName: 'Jugador',
        handle: `@${p.player_id.slice(0, 8)}`,
        avatar: '/placeholder-user.jpg',
        rank: 0,
        rankDelta: 0,
        tier: '—',
        wins: 0,
        losses: 0,
        streak: 0,
        rating: 1200,
        region: province,
        status: 'online' as const,
      }
    }
    return profileToPlayer(p.profiles, province)
  }

  return {
    id: match.id,
    loadedById: match.loaded_by_id,
    playedAt: formatPlayedAt(match.played_at),
    sortOrder,
    club: match.club_name,
    teamA: [toPlayer(teamA[0]), toPlayer(teamA[1])],
    teamB: [toPlayer(teamB[0]), toPlayer(teamB[1])],
    score: match.score,
    winnerTeam: match.winner_team,
    confirmations: participants.map((p) => ({
      playerId: p.player_id,
      confirmed: p.confirmed,
    })),
    skillStakes:
      match.team_a_skill_avg != null && match.team_b_skill_avg != null
        ? {
            teamAAvg: Number(match.team_a_skill_avg),
            teamBAvg: Number(match.team_b_skill_avg),
            gainIfAWins: Number(match.skill_stake_if_a_wins ?? 0),
            lossIfAWins: -Math.abs(Number(match.skill_stake_if_a_wins ?? 0)),
            gainIfBWins: Number(match.skill_stake_if_b_wins ?? 0),
            lossIfAWinsForA: -Math.abs(Number(match.skill_stake_if_b_wins ?? 0)),
            transferIfAWins: Number(match.skill_stake_if_a_wins ?? 0),
            transferIfBWins: Number(match.skill_stake_if_b_wins ?? 0),
          }
        : undefined,
  }
}
