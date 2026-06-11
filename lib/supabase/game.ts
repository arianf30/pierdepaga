import type { SupabaseClient } from '@supabase/supabase-js'
import {
  computeMatchSkillStakes,
  type MatchSkillStakes,
} from '@/lib/ranking/match-stakes'
import { SKILL_START } from '@/lib/ranking/formulas'
import type {
  ClubRow,
  CreateMatchInput,
  MatchParticipantRow,
  MatchRow,
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

export async function searchClubs(
  supabase: SupabaseClient,
  countryId: string,
  province: string,
  query: string,
  limit = 20,
): Promise<ClubRow[]> {
  let q = supabase
    .from('clubs')
    .select('*')
    .eq('country_id', countryId)
    .eq('province', province)
    .order('name')
    .limit(limit)

  if (query.trim()) {
    q = q.ilike('name', `%${query.trim()}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as ClubRow[]
}

export async function createClub(
  supabase: SupabaseClient,
  input: {
    name: string
    country_id: string
    province: string
    created_by: string
  },
): Promise<ClubRow> {
  const { data, error } = await supabase
    .from('clubs')
    .insert(input)
    .select('*')
    .single()

  if (error) throw error
  return data as ClubRow
}

export async function fetchPlayerSkillsInScope(
  supabase: SupabaseClient,
  scopeId: string,
  playerIds: string[],
): Promise<Record<string, number>> {
  const skills: Record<string, number> = {}

  for (const playerId of playerIds) {
    await supabase.rpc('ensure_player_ranking', {
      p_scope_id: scopeId,
      p_player_id: playerId,
    })
  }

  const { data, error } = await supabase
    .from('player_rankings')
    .select('player_id, skill_rating')
    .eq('scope_id', scopeId)
    .in('player_id', playerIds)

  if (error) throw error

  for (const row of data ?? []) {
    skills[row.player_id as string] = Number(row.skill_rating)
  }

  for (const playerId of playerIds) {
    if (skills[playerId] == null) skills[playerId] = SKILL_START
  }

  return skills
}

export async function resolveMatchSkillStakes(
  supabase: SupabaseClient,
  scopeId: string,
  teamA: [string, string],
  teamB: [string, string],
): Promise<MatchSkillStakes> {
  const ids = [...teamA, ...teamB]
  const skills = await fetchPlayerSkillsInScope(supabase, scopeId, ids)

  return computeMatchSkillStakes(
    [skills[teamA[0]], skills[teamA[1]]],
    [skills[teamB[0]], skills[teamB[1]]],
  )
}

export async function createPendingMatch(
  supabase: SupabaseClient,
  loaderId: string,
  input: CreateMatchInput,
): Promise<MatchRow> {
  const scope = await getOrCreateScope(
    supabase,
    input.club_country_id,
    input.club_province,
    input.sport_id,
  )

  let clubId = input.club_id ?? null

  if (!clubId && input.club_name.trim()) {
    const { data: existing } = await supabase
      .from('clubs')
      .select('id')
      .eq('country_id', input.club_country_id)
      .eq('province', input.club_province)
      .ilike('name', input.club_name.trim())
      .maybeSingle()

    if (existing) {
      clubId = existing.id
    } else {
      const club = await createClub(supabase, {
        name: input.club_name.trim(),
        country_id: input.club_country_id,
        province: input.club_province,
        created_by: loaderId,
      })
      clubId = club.id
    }
  }

  const stakes = await resolveMatchSkillStakes(
    supabase,
    scope.id,
    input.team_a,
    input.team_b,
  )

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      scope_id: scope.id,
      match_type: input.match_type,
      status: 'pending_confirmation',
      club_id: clubId,
      club_name: input.club_name.trim(),
      stake_amount: input.stake_amount ?? null,
      played_at: input.played_at,
      score: input.score,
      winner_team: input.winner_team,
      loaded_by_id: loaderId,
      team_a_skill_avg: stakes.teamAAvg,
      team_b_skill_avg: stakes.teamBAvg,
      skill_stake_if_a_wins: stakes.transferIfAWins,
      skill_stake_if_b_wins: stakes.transferIfBWins,
      skill_loss_if_a_wins: -stakes.transferIfAWins,
      skill_loss_if_b_wins: -stakes.transferIfBWins,
    })
    .select('*')
    .single()

  if (matchError) throw matchError

  const participants = [
    { match_id: match.id, player_id: input.team_a[0], team: 'A', slot: 1 },
    { match_id: match.id, player_id: input.team_a[1], team: 'A', slot: 2 },
    { match_id: match.id, player_id: input.team_b[0], team: 'B', slot: 1 },
    { match_id: match.id, player_id: input.team_b[1], team: 'B', slot: 2 },
  ].map((row) => ({
    ...row,
    confirmed: row.player_id === loaderId,
    confirmed_at: row.player_id === loaderId ? new Date().toISOString() : null,
    skill_before:
      row.team === 'A'
        ? row.slot === 1
          ? stakes.teamASkills[0]
          : stakes.teamASkills[1]
        : row.slot === 1
          ? stakes.teamBSkills[0]
          : stakes.teamBSkills[1],
  }))

  const { error: participantsError } = await supabase
    .from('match_participants')
    .insert(participants)

  if (participantsError) throw participantsError

  return match as MatchRow
}

export async function confirmMatch(
  supabase: SupabaseClient,
  matchId: string,
  playerId: string,
): Promise<MatchRow> {
  const { data, error } = await supabase.rpc('confirm_match_participant', {
    p_match_id: matchId,
    p_player_id: playerId,
  })

  if (error) throw error
  return data as MatchRow
}

export async function fetchMatchWithParticipants(
  supabase: SupabaseClient,
  matchId: string,
): Promise<{ match: MatchRow; participants: MatchParticipantRow[] } | null> {
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle()

  if (matchError) throw matchError
  if (!match) return null

  const { data: participants, error: partError } = await supabase
    .from('match_participants')
    .select('*')
    .eq('match_id', matchId)
    .order('team')
    .order('slot')

  if (partError) throw partError

  return {
    match: match as MatchRow,
    participants: (participants ?? []) as MatchParticipantRow[],
  }
}

export async function fetchPendingMatchesDetailed(
  supabase: SupabaseClient,
  playerId: string,
) {
  const { data, error } = await supabase
    .from('match_participants')
    .select(
      `
      match:matches!inner(
        *,
        participants:match_participants(
          *,
          profiles (
            id,
            first_name,
            last_name,
            display_name,
            avatar_url
          )
        )
      )
    `,
    )
    .eq('player_id', playerId)
    .eq('match.status', 'pending_confirmation')
    .order('match(played_at)', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const nested = (row as {
      match: MatchRow & {
        participants: Array<
          MatchParticipantRow & {
            profiles: {
              id: string
              first_name: string
              last_name: string
              display_name: string
              avatar_url: string | null
            } | null
          }
        >
      }
    }).match

    const { participants, ...match } = nested

    return { match, participants: participants ?? [] }
  })
}

export async function cancelPendingMatch(
  supabase: SupabaseClient,
  matchId: string,
  loaderId: string,
): Promise<void> {
  const { data: match, error: fetchError } = await supabase
    .from('matches')
    .select('id, loaded_by_id, status')
    .eq('id', matchId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!match) throw new Error('Partido no encontrado')
  if (match.loaded_by_id !== loaderId) {
    throw new Error('Solo quien cargó el partido puede cancelarlo')
  }
  if (match.status !== 'pending_confirmation') {
    throw new Error('Este partido ya no se puede cancelar')
  }

  const { error } = await supabase
    .from('matches')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', matchId)

  if (error) throw error
}

export type PlayerSearchRow = {
  id: string
  first_name: string
  last_name: string
  display_name: string
  avatar_url: string | null
  ranking: PlayerRankingRow | null
}

export async function searchPlayersInScope(
  supabase: SupabaseClient,
  scopeId: string,
  query: string,
  excludeIds: string[] = [],
  limit = 20,
): Promise<PlayerSearchRow[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  let q = supabase
    .from('profiles')
    .select(
      `
      id,
      first_name,
      last_name,
      display_name,
      avatar_url,
      player_rankings (
        scope_id,
        player_id,
        skill_rating,
        matches_played,
        wins,
        losses,
        streak,
        rank_position,
        rank_delta,
        composite_score,
        best_positive_streak,
        first_match_at,
        last_match_at,
        ranked_at
      )
    `,
    )
    .eq('account_type', 'jugador')
    .or(
      `display_name.ilike.%${trimmed}%,first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%`,
    )
    .limit(limit * 2)

  const { data, error } = await q
  if (error) throw error

  return (data ?? [])
    .filter((row) => !excludeIds.includes((row as { id: string }).id))
    .map((row) => {
      const item = row as {
        id: string
        first_name: string
        last_name: string
        display_name: string
        avatar_url: string | null
        player_rankings: PlayerRankingRow[] | null
      }

      const scoped =
        item.player_rankings?.find((entry) => entry.scope_id === scopeId) ??
        null

      return {
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        display_name: item.display_name,
        avatar_url: item.avatar_url,
        ranking: scoped,
      }
    })
}

export async function fetchPendingMatchesForPlayer(
  supabase: SupabaseClient,
  playerId: string,
): Promise<MatchRow[]> {
  const { data, error } = await supabase
    .from('match_participants')
    .select('match:matches!inner(*)')
    .eq('player_id', playerId)
    .eq('match.status', 'pending_confirmation')

  if (error) throw error

  return (data ?? []).map((row) => (row as { match: MatchRow }).match)
}
