'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  mapPendingMatchBundle,
  type PendingMatchBundle,
} from '@/lib/ranking/map-pending-match'
import type { PendingSimpleMatch } from '@/lib/pending-activities'
import { useRegion } from '@/components/region-provider'

export function usePendingMatches() {
  const { province } = useRegion()
  const [matches, setMatches] = useState<PendingSimpleMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/matches', {
        credentials: 'include',
        cache: 'no-store',
      })
      const body = (await response.json()) as {
        pending?: PendingMatchBundle[]
        error?: string
      }

      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudieron cargar los partidos')
      }

      const mapped = (body.pending ?? [])
        .map((bundle, index) => mapPendingMatchBundle(bundle, province, index + 1))
        .filter((item): item is PendingSimpleMatch => item !== null)

      setMatches(mapped)
    } catch (err) {
      setMatches([])
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar los partidos',
      )
    } finally {
      setLoading(false)
    }
  }, [province])

  useEffect(() => {
    void load()
  }, [load])

  return { matches, loading, error, refresh: load }
}
