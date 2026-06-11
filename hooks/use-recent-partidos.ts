'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RecentMatch } from '@/lib/supabase/partidos'
import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'

export function useRecentPartidos() {
  const { country, province } = useRegion()
  const { sport } = useSport()
  const [recientes, setRecientes] = useState<RecentMatch[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ country, province, sport })
      const response = await fetch(`/api/partidos/recent?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const body = (await response.json()) as { recientes?: RecentMatch[] }
      if (!response.ok) {
        setRecientes([])
        return
      }
      setRecientes(body.recientes ?? [])
    } catch {
      setRecientes([])
    } finally {
      setLoading(false)
    }
  }, [country, province, sport])

  useEffect(() => {
    void load()
  }, [load])

  return { recientes, loading, refresh: load }
}
