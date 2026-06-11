'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PendingPartido } from '@/lib/supabase/partidos'
import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'

export function usePendingPartidos() {
  const { country, province } = useRegion()
  const { sport } = useSport()
  const [partidos, setPartidos] = useState<PendingPartido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ country, province, sport })
      const response = await fetch(`/api/partidos?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const body = (await response.json()) as {
        partidos?: PendingPartido[]
        error?: string
      }
      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudieron cargar los partidos')
      }
      setPartidos(body.partidos ?? [])
    } catch (err) {
      setPartidos([])
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar los partidos',
      )
    } finally {
      setLoading(false)
    }
  }, [country, province, sport])

  useEffect(() => {
    void load()
  }, [load])

  return { partidos, loading, error, refresh: load }
}
