import type { SupabaseClient } from '@supabase/supabase-js'
import {
  RANKING_INITIAL_SCORE,
  RANKING_INITIAL_SKILL,
  RANKING_INITIAL_STREAK,
  type RankingBoardEntry,
  type RankingRow,
} from '@/lib/types/ranking'

/** Fila de búsqueda de jugadores: misma forma que consume PlayerSearchField. */
export type RankingPlayerSearchRow = {
  id: string
  first_name: string
  last_name: string
  display_name: string
  avatar_url: string | null
  ranking: {
    rank_position: number | null
    skill_rating: number
    wins: number
    losses: number
    streak: number
    rank_delta: number
  } | null
}

/** Habilidad + racha de un jugador en un scope (para guardar en partidos). */
export type PlayerSkillSnapshot = {
  habilidad: number | null
  racha: string | null
}

function parseStreakText(racha: string | null): number {
  if (!racha) return 0
  const n = parseInt(racha, 10)
  return Number.isNaN(n) ? 0 : n
}

type ScopeFilter = {
  country: string
  province: string
  sport: string
}

/**
 * Trae el ranking de un scope (país + provincia + deporte) ordenado por score
 * descendente. La posición se deriva del orden: mayor score = puesto 1.
 */
export async function fetchScopeRanking(
  supabase: SupabaseClient,
  { country, province, sport }: ScopeFilter,
): Promise<RankingBoardEntry[]> {
  const { data, error } = await supabase
    .from('ranking')
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
    .eq('pais', country)
    .eq('provincia', province)
    .eq('deporte', sport)
    .order('score', { ascending: false })
    .order('habilidad', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const item = row as RankingRow & {
      profiles: RankingBoardEntry['profile'] | null
    }
    const { profiles, ...ranking } = item
    return { ...ranking, profile: profiles ?? undefined }
  })
}

/** ¿El jugador ya tiene fila en este scope? */
export async function fetchMyRankingRow(
  supabase: SupabaseClient,
  { country, province, sport }: ScopeFilter,
  jugadorId: string,
): Promise<RankingRow | null> {
  const { data, error } = await supabase
    .from('ranking')
    .select('*')
    .eq('pais', country)
    .eq('provincia', province)
    .eq('deporte', sport)
    .eq('jugador_id', jugadorId)
    .maybeSingle()

  if (error) throw error
  return (data as RankingRow | null) ?? null
}

/**
 * Fila de ranking de un jugador en un scope + su posición calculada por score
 * (mayor score = puesto 1). Devuelve rank null si no está inscripto.
 */
export async function fetchPlayerScopeRanking(
  supabase: SupabaseClient,
  { country, province, sport }: ScopeFilter,
  jugadorId: string,
): Promise<{ entry: RankingBoardEntry | null; rank: number | null }> {
  const { data, error } = await supabase
    .from('ranking')
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
    .eq('pais', country)
    .eq('provincia', province)
    .eq('deporte', sport)
    .eq('jugador_id', jugadorId)
    .maybeSingle()

  if (error) throw error
  if (!data) return { entry: null, rank: null }

  const item = data as RankingRow & {
    profiles: RankingBoardEntry['profile'] | null
  }
  const { profiles, ...ranking } = item
  const entry: RankingBoardEntry = { ...ranking, profile: profiles ?? undefined }

  const { count, error: countError } = await supabase
    .from('ranking')
    .select('id', { count: 'exact', head: true })
    .eq('pais', country)
    .eq('provincia', province)
    .eq('deporte', sport)
    .gt('score', entry.score)

  if (countError) throw countError

  return { entry, rank: (count ?? 0) + 1 }
}

/**
 * Inscribe al jugador en el ranking del scope con habilidad inicial 1200 y
 * score 0. Idempotente: si ya existe (único por scope+jugador) devuelve la fila.
 */
export async function enrollInRanking(
  supabase: SupabaseClient,
  { country, province, sport }: ScopeFilter,
  jugadorId: string,
): Promise<RankingRow> {
  const existing = await fetchMyRankingRow(
    supabase,
    { country, province, sport },
    jugadorId,
  )
  if (existing) return existing

  const { data, error } = await supabase
    .from('ranking')
    .insert({
      pais: country,
      provincia: province,
      deporte: sport,
      jugador_id: jugadorId,
      habilidad: RANKING_INITIAL_SKILL,
      score: RANKING_INITIAL_SCORE,
      racha: RANKING_INITIAL_STREAK,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as RankingRow
}

/**
 * Busca jugadores INSCRIPTOS en el ranking del scope (inner join con ranking)
 * por nombre. Solo devuelve quienes están registrados en ese país/provincia/
 * deporte. La forma coincide con la que consume PlayerSearchField.
 */
export async function searchRankingPlayers(
  supabase: SupabaseClient,
  { country, province, sport }: ScopeFilter,
  query: string,
  excludeIds: string[] = [],
  limit = 20,
): Promise<RankingPlayerSearchRow[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      first_name,
      last_name,
      display_name,
      avatar_url,
      ranking!inner (
        pais,
        provincia,
        deporte,
        habilidad,
        racha,
        pg,
        pp,
        ultima_posicion
      )
    `,
    )
    .eq('account_type', 'jugador')
    .eq('ranking.pais', country)
    .eq('ranking.provincia', province)
    .eq('ranking.deporte', sport)
    .or(
      `display_name.ilike.%${trimmed}%,first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%`,
    )
    .limit(limit * 2)

  if (error) throw error

  type Row = {
    id: string
    first_name: string
    last_name: string
    display_name: string
    avatar_url: string | null
    ranking: Array<{
      habilidad: number | null
      racha: string | null
      pg: number
      pp: number
      ultima_posicion: number | null
    }>
  }

  return (data ?? [])
    .filter((row) => !excludeIds.includes((row as Row).id))
    .slice(0, limit)
    .map((row) => {
      const item = row as Row
      const r = item.ranking?.[0]
      return {
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        display_name: item.display_name,
        avatar_url: item.avatar_url,
        ranking: r
          ? {
              rank_position: r.ultima_posicion,
              skill_rating: Number(r.habilidad ?? 0),
              wins: r.pg,
              losses: r.pp,
              streak: parseStreakText(r.racha),
              rank_delta: 0,
            }
          : null,
      }
    })
}

/**
 * Trae habilidad + racha actuales de varios jugadores en un scope.
 * Devuelve un Map id → {habilidad, racha}. Solo incluye inscriptos.
 */
export async function fetchPlayersSkillSnapshot(
  supabase: SupabaseClient,
  { country, province, sport }: ScopeFilter,
  jugadorIds: string[],
): Promise<Map<string, PlayerSkillSnapshot>> {
  if (jugadorIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('ranking')
    .select('jugador_id, habilidad, racha')
    .eq('pais', country)
    .eq('provincia', province)
    .eq('deporte', sport)
    .in('jugador_id', jugadorIds)

  if (error) throw error

  const map = new Map<string, PlayerSkillSnapshot>()
  for (const row of (data ?? []) as Array<{
    jugador_id: string
    habilidad: number | null
    racha: string | null
  }>) {
    map.set(row.jugador_id, { habilidad: row.habilidad, racha: row.racha })
  }
  return map
}
