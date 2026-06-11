import type { SupabaseClient } from '@supabase/supabase-js'

export type PlayerLite = {
  id: string
  name: string
  avatar: string | null
}

export type MatchHistoryEntry = {
  id: string
  date: string
  score: string
  result: 'G' | 'P'
  /** Equipo del jugador: [jugador, compañero]. */
  team: PlayerLite[]
  /** Rivales: [jugador 1, jugador 2]. */
  rivals: PlayerLite[]
}

export type RecentMatch = {
  id: string
  date: string
  score: string
  winnerTeam: 'A' | 'B' | null
  teamA: PlayerLite[]
  teamB: PlayerLite[]
}

export type PendingPartido = {
  id: string
  fecha: string
  club: string | null
  resultado: string | null
  ganador: 'A' | 'B' | null
  puntos_ganados: number | null
  estado: string
  loaderId: string | null
  teamA: PlayerLite[]
  teamB: PlayerLite[]
  confirms: { j2a: boolean; j1b: boolean; j2b: boolean }
  /** Slot del usuario actual y si puede confirmar. */
  me: {
    slot: 'loader' | 'j2a' | 'j1b' | 'j2b' | null
    confirmed: boolean
    canConfirm: boolean
  }
}

type PartidoRow = {
  id: string
  fecha: string
  club: string | null
  resultado: string | null
  ganador: 'A' | 'B' | null
  puntos_ganados: number | null
  estado: string
  j1a_id: string | null
  j2a_id: string | null
  j1b_id: string | null
  j2b_id: string | null
  j2a_confirm: boolean
  j1b_confirm: boolean
  j2b_confirm: boolean
}

type ScopeFilter = {
  country: string
  province: string
  sport: string
}

/** Partidos pendientes en los que participa el usuario, en un scope dado. */
export async function fetchPendingPartidosForUser(
  supabase: SupabaseClient,
  userId: string,
  scope: ScopeFilter,
): Promise<PendingPartido[]> {
  const { data, error } = await supabase
    .from('partidos')
    .select(
      'id, fecha, club, resultado, ganador, puntos_ganados, estado, j1a_id, j2a_id, j1b_id, j2b_id, j2a_confirm, j1b_confirm, j2b_confirm',
    )
    .eq('estado', 'pendiente')
    .eq('pais', scope.country)
    .eq('provincia', scope.province)
    .eq('deporte', scope.sport)
    .or(
      `j1a_id.eq.${userId},j2a_id.eq.${userId},j1b_id.eq.${userId},j2b_id.eq.${userId}`,
    )
    .order('fecha', { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as PartidoRow[]
  if (rows.length === 0) return []

  // Perfiles de todos los jugadores involucrados.
  const ids = Array.from(
    new Set(
      rows.flatMap((r) =>
        [r.j1a_id, r.j2a_id, r.j1b_id, r.j2b_id].filter(
          (x): x is string => !!x,
        ),
      ),
    ),
  )

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, display_name, avatar_url')
    .in('id', ids)

  if (profilesError) throw profilesError

  const nameById = new Map<string, PlayerLite>()
  for (const p of (profiles ?? []) as Array<{
    id: string
    first_name: string
    last_name: string
    display_name: string
    avatar_url: string | null
  }>) {
    const full = `${p.first_name} ${p.last_name}`.trim()
    nameById.set(p.id, {
      id: p.id,
      name: p.display_name?.trim() || full || 'Jugador',
      avatar: p.avatar_url,
    })
  }

  const toLite = (id: string | null): PlayerLite =>
    (id && nameById.get(id)) || {
      id: id ?? '',
      name: 'Jugador',
      avatar: null,
    }

  return rows.map((r) => {
    let slot: PendingPartido['me']['slot'] = null
    let confirmed = false
    if (r.j1a_id === userId) {
      slot = 'loader'
      confirmed = true
    } else if (r.j2a_id === userId) {
      slot = 'j2a'
      confirmed = r.j2a_confirm
    } else if (r.j1b_id === userId) {
      slot = 'j1b'
      confirmed = r.j1b_confirm
    } else if (r.j2b_id === userId) {
      slot = 'j2b'
      confirmed = r.j2b_confirm
    }

    return {
      id: r.id,
      fecha: r.fecha,
      club: r.club,
      resultado: r.resultado,
      ganador: r.ganador,
      puntos_ganados: r.puntos_ganados,
      estado: r.estado,
      loaderId: r.j1a_id,
      teamA: [toLite(r.j1a_id), toLite(r.j2a_id)],
      teamB: [toLite(r.j1b_id), toLite(r.j2b_id)],
      confirms: {
        j2a: r.j2a_confirm,
        j1b: r.j1b_confirm,
        j2b: r.j2b_confirm,
      },
      me: {
        slot,
        confirmed,
        canConfirm: slot !== null && slot !== 'loader' && !confirmed,
      },
    }
  })
}

type HistoryRow = {
  id: string
  fecha: string
  resultado: string | null
  ganador: 'A' | 'B' | null
  club: string | null
  j1a_id: string | null
  j2a_id: string | null
  j1b_id: string | null
  j2b_id: string | null
}

/** Últimos partidos jugados (cargados) por un jugador en un scope. */
export async function fetchPlayerMatchHistory(
  supabase: SupabaseClient,
  scope: ScopeFilter,
  playerId: string,
  limit = 10,
): Promise<MatchHistoryEntry[]> {
  const { data, error } = await supabase
    .from('partidos')
    .select(
      'id, fecha, resultado, ganador, club, j1a_id, j2a_id, j1b_id, j2b_id',
    )
    .eq('estado', 'cargado')
    .eq('pais', scope.country)
    .eq('provincia', scope.province)
    .eq('deporte', scope.sport)
    .or(
      `j1a_id.eq.${playerId},j2a_id.eq.${playerId},j1b_id.eq.${playerId},j2b_id.eq.${playerId}`,
    )
    .order('fecha', { ascending: false })
    .limit(limit)

  if (error) throw error

  const rows = (data ?? []) as HistoryRow[]
  if (rows.length === 0) return []

  const ids = Array.from(
    new Set(
      rows.flatMap((r) =>
        [r.j1a_id, r.j2a_id, r.j1b_id, r.j2b_id].filter(
          (x): x is string => !!x,
        ),
      ),
    ),
  )

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, display_name, avatar_url')
    .in('id', ids)

  if (profilesError) throw profilesError

  const liteById = new Map<string, PlayerLite>()
  for (const p of (profiles ?? []) as Array<{
    id: string
    first_name: string
    last_name: string
    display_name: string
    avatar_url: string | null
  }>) {
    const full = `${p.first_name} ${p.last_name}`.trim()
    liteById.set(p.id, {
      id: p.id,
      name: p.display_name?.trim() || full || 'Jugador',
      avatar: p.avatar_url,
    })
  }

  const liteOf = (id: string | null): PlayerLite =>
    (id && liteById.get(id)) || { id: id ?? '', name: 'Jugador', avatar: null }

  return rows.map((r) => {
    const onTeamA = r.j1a_id === playerId || r.j2a_id === playerId
    const myTeam: 'A' | 'B' = onTeamA ? 'A' : 'B'

    // El jugador consultado primero, después su compañero.
    const teamMates = onTeamA
      ? [r.j1a_id, r.j2a_id]
      : [r.j1b_id, r.j2b_id]
    const partnerId = teamMates.find((id) => id !== playerId) ?? null
    const team = [liteOf(playerId), liteOf(partnerId)]

    const rivals = onTeamA
      ? [liteOf(r.j1b_id), liteOf(r.j2b_id)]
      : [liteOf(r.j1a_id), liteOf(r.j2a_id)]

    return {
      id: r.id,
      result: (r.ganador === myTeam ? 'G' : 'P') as 'G' | 'P',
      score: r.resultado ?? '',
      team,
      rivals,
      date: new Date(r.fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
      }),
    }
  })
}

/** Últimos partidos cargados de un scope (feed de "Recientes" en Inicio). */
export async function fetchRecentPartidos(
  supabase: SupabaseClient,
  scope: ScopeFilter,
  limit = 6,
): Promise<RecentMatch[]> {
  const { data, error } = await supabase
    .from('partidos')
    .select(
      'id, fecha, resultado, ganador, j1a_id, j2a_id, j1b_id, j2b_id',
    )
    .eq('estado', 'cargado')
    .eq('pais', scope.country)
    .eq('provincia', scope.province)
    .eq('deporte', scope.sport)
    .order('fecha', { ascending: false })
    .limit(limit)

  if (error) throw error

  const rows = (data ?? []) as Array<{
    id: string
    fecha: string
    resultado: string | null
    ganador: 'A' | 'B' | null
    j1a_id: string | null
    j2a_id: string | null
    j1b_id: string | null
    j2b_id: string | null
  }>
  if (rows.length === 0) return []

  const ids = Array.from(
    new Set(
      rows.flatMap((r) =>
        [r.j1a_id, r.j2a_id, r.j1b_id, r.j2b_id].filter(
          (x): x is string => !!x,
        ),
      ),
    ),
  )

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, display_name, avatar_url')
    .in('id', ids)

  if (profilesError) throw profilesError

  const liteById = new Map<string, PlayerLite>()
  for (const p of (profiles ?? []) as Array<{
    id: string
    first_name: string
    last_name: string
    display_name: string
    avatar_url: string | null
  }>) {
    const full = `${p.first_name} ${p.last_name}`.trim()
    liteById.set(p.id, {
      id: p.id,
      name: p.display_name?.trim() || full || 'Jugador',
      avatar: p.avatar_url,
    })
  }

  const liteOf = (id: string | null): PlayerLite =>
    (id && liteById.get(id)) || { id: id ?? '', name: 'Jugador', avatar: null }

  return rows.map((r) => ({
    id: r.id,
    date: new Date(r.fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    }),
    score: r.resultado ?? '',
    winnerTeam: r.ganador,
    teamA: [liteOf(r.j1a_id), liteOf(r.j2a_id)],
    teamB: [liteOf(r.j1b_id), liteOf(r.j2b_id)],
  }))
}
