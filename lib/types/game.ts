export type MatchType = 'simple' | 'pierde_paga'

export type MatchStatus = 'pending_confirmation' | 'confirmed' | 'cancelled'

export type TeamSide = 'A' | 'B'

export type RankingScope = {
  id: string
  country_id: string
  province: string
  sport_id: string
  created_at: string
}

export type PlayerRankingRow = {
  scope_id: string
  player_id: string
  skill_rating: number
  matches_played: number
  wins: number
  losses: number
  streak: number
  best_positive_streak: number
  composite_score: number
  rank_position: number | null
  rank_delta: number
  first_match_at: string | null
  last_match_at: string | null
  ranked_at: string | null
}

export type ClubRow = {
  id: string
  name: string
  country_id: string
  province: string
  created_by: string | null
  is_verified: boolean
  created_at: string
}

export type MatchRow = {
  id: string
  scope_id: string
  match_type: MatchType
  status: MatchStatus
  club_id: string | null
  club_name: string
  stake_amount: number | null
  played_at: string
  scheduled_at: string | null
  score: string
  winner_team: TeamSide
  loaded_by_id: string
  challenge_id: string | null
  admin_resolved: boolean
  team_a_skill_avg: number | null
  team_b_skill_avg: number | null
  skill_stake_if_a_wins: number | null
  skill_stake_if_b_wins: number | null
  skill_loss_if_a_wins: number | null
  skill_loss_if_b_wins: number | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export type MatchParticipantRow = {
  match_id: string
  player_id: string
  team: TeamSide
  slot: 1 | 2
  confirmed: boolean
  confirmed_at: string | null
  skill_before: number | null
  skill_after: number | null
  skill_delta: number | null
}

export type RankingLeaderboardEntry = PlayerRankingRow & {
  profile?: {
    display_name: string
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

export type CreateMatchInput = {
  match_type: MatchType
  club_id?: string | null
  club_name: string
  club_country_id: string
  club_province: string
  sport_id: string
  played_at: string
  score: string
  winner_team: TeamSide
  stake_amount?: number | null
  team_a: [string, string]
  team_b: [string, string]
}
