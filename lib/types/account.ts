export type AccountType = 'jugador' | 'sponsor'

export type ProfileRow = {
  id: string
  account_type: AccountType
  first_name: string
  last_name: string
  display_name: string
  dni: string | null
  instagram: string | null
  avatar_url: string | null
  country_id: string
  province: string
  address: string | null
  phone: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type ProfileUpdateInput = {
  first_name: string
  last_name: string
  display_name: string
  dni: string | null
  instagram: string | null
  avatar_url: string | null
  country_id: string
  province: string
  address: string | null
  phone: string | null
}

export type SponsorPrizeType = 'ranking' | 'streak'

export type SponsorPrizeStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'delivered'

export type SponsorPrizeSubmission = {
  id: string
  user_id: string
  country_id: string
  province: string
  sport_id: string
  scope_id: string | null
  title: string
  detail: string
  sponsor_brand: string
  image_url: string | null
  prize_type: SponsorPrizeType
  ranking_position: 1 | 2 | 3 | null
  streak_milestone: number | null
  quantity_available: number
  delivered_count: number
  status: SponsorPrizeStatus
  created_at: string
}

export type SponsorPrizeTarget =
  | { prizeType: 'ranking'; rankingPosition: 1 | 2 | 3 }
  | { prizeType: 'streak'; streakMilestone: number }
