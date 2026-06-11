import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  PlayerRankingRow,
  RankingLeaderboardEntry,
  RankingScope,
} from '@/lib/types/game'

export async function getOrCreateScope(
  supabase: SupabaseClient,
  countryId: string,
  province: string,
  sportId: string,
): Promise<RankingScope> {
  const { data, error } = await supabase.rpc('get_or_create_ranking_scope', {
    p_country_id: countryId,
    p_province: province,
    p_sport_id: sportId,
  })

  if (error) throw error

  const scopeId = data as string
  const { data: scope, error: scopeError } = await supabase
    .from('ranking_scopes')
    .select('*')
    .eq('id', scopeId)
    .single()

  if (scopeError) throw scopeError
  return scope as RankingScope
}

export async function fetchLeaderboard(
  supabase: SupabaseClient,
  scopeId: string,
  limit = 50,
): Promise<RankingLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('player_rankings')
    .select(
      `
      *,
      profiles (
        display_name,
        first_name,
        last_name,
        avatar_url
      )
    `,
    )
    .eq('scope_id', scopeId)
    .gt('matches_played', 0)
    .order('composite_score', { ascending: false })
    .order('matches_played', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => {
    const item = row as PlayerRankingRow & {
      profiles: RankingLeaderboardEntry['profile'] | null
    }
    const { profiles, ...ranking } = item
    return { ...ranking, profile: profiles ?? undefined }
  })
}

export async function fetchPlayerRanking(
  supabase: SupabaseClient,
  scopeId: string,
  playerId: string,
): Promise<PlayerRankingRow | null> {
  const { data, error } = await supabase
    .from('player_rankings')
    .select('*')
    .eq('scope_id', scopeId)
    .eq('player_id', playerId)
    .maybeSingle()

  if (error) throw error
  return data as PlayerRankingRow | null
}
