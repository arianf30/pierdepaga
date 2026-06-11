'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Player } from '@/lib/data'
import { mapLeaderboardEntryToPlayer } from '@/lib/ranking/map-player'
import type { RankingLeaderboardEntry, RankingScope } from '@/lib/types/game'
import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'

type RankingState = {
  scope: RankingScope | null
  leaderboard: Player[]
  myRanking: RankingLeaderboardEntry | null
  loading: boolean
  error: string | null
}

export function useRanking() {
  const { country, province } = useRegion()
  const { sport } = useSport()
  const [state, setState] = useState<RankingState>({
    scope: null,
    leaderboard: [],
    myRanking: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams({
        country,
        province,
        sport,
      })
      const response = await fetch(`/api/ranking?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const body = (await response.json()) as {
        scope?: RankingScope
        leaderboard?: RankingLeaderboardEntry[]
        myRanking?: RankingLeaderboardEntry | null
        error?: string
      }

      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudo cargar el ranking')
      }

      const leaderboard = (body.leaderboard ?? []).map((entry) =>
        mapLeaderboardEntryToPlayer(entry, province),
      )

      setState({
        scope: body.scope ?? null,
        leaderboard,
        myRanking: body.myRanking ?? null,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState({
        scope: null,
        leaderboard: [],
        myRanking: null,
        loading: false,
        error:
          err instanceof Error ? err.message : 'No se pudo cargar el ranking',
      })
    }
  }, [country, province, sport])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, refresh: load }
}
