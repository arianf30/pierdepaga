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
  sets_won: number
  sets_lost: number
  games_won: number
  games_lost: number
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
  sets_won?: number
  sets_lost?: number
  games_won?: number
  games_lost?: number
}

export type SponsorPrizeSubmission = {
  id: string
  sponsor_id: string
  title: string
  detail: string
  sponsor_brand: string
  image_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
