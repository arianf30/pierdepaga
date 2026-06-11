'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Player } from '@/lib/data'
import { mapRankingEntryToPlayer } from '@/lib/ranking/map-ranking'
import type { RankingBoardEntry, RankingRow } from '@/lib/types/ranking'
import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'

type ScopeRankingState = {
  players: Player[]
  myRow: RankingRow | null
  loading: boolean
  error: string | null
}

export function useScopeRanking() {
  const { country, province } = useRegion()
  const { sport } = useSport()
  const [state, setState] = useState<ScopeRankingState>({
    players: [],
    myRow: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams({ country, province, sport })
      const response = await fetch(`/api/ranking/board?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const body = (await response.json()) as {
        leaderboard?: RankingBoardEntry[]
        myRow?: RankingRow | null
        error?: string
      }

      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudo cargar el ranking')
      }

      const players = (body.leaderboard ?? []).map((entry, index) =>
        mapRankingEntryToPlayer(entry, index, province),
      )

      setState({
        players,
        myRow: body.myRow ?? null,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState({
        players: [],
        myRow: null,
        loading: false,
        error:
          err instanceof Error ? err.message : 'No se pudo cargar el ranking',
      })
    }
  }, [country, province, sport])

  const enroll = useCallback(async () => {
    const params = new URLSearchParams({ country, province, sport })
    const response = await fetch(`/api/ranking/board?${params}`, {
      method: 'POST',
      credentials: 'include',
    })
    const body = (await response.json()) as {
      row?: RankingRow
      error?: string
    }

    if (!response.ok) {
      throw new Error(body.error ?? 'No se pudo completar la inscripción')
    }

    await load()
    return body.row ?? null
  }, [country, province, sport, load])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, enroll, refresh: load }
}
