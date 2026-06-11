/** Fila de la tabla plana public.ranking (un jugador por scope). */
export type RankingRow = {
  id: string
  pais: string
  provincia: string
  deporte: string
  jugador_id: string
  pj: number
  pg: number
  pp: number
  sets_ganados: number
  sets_perdidos: number
  games_ganados: number
  games_perdidos: number
  habilidad: number | null
  racha: string | null
  score: number
  ultima_posicion: number | null
  max_habilidad: number | null
  max_habilidad_fecha: string | null
  max_racha: number | null
  max_racha_fecha: string | null
  max_posicion: number | null
  max_posicion_fecha: string | null
  created_at: string
  updated_at: string
}

export type RankingBoardEntry = RankingRow & {
  profile?: {
    display_name: string
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

/** Habilidad y score iniciales al inscribirse gratis. */
export const RANKING_INITIAL_SKILL = 1200
export const RANKING_INITIAL_SCORE = 0
export const RANKING_INITIAL_STREAK = '0'
