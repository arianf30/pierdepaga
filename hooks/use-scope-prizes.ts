'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SponsorPrizeSubmission } from '@/lib/types/account'
import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'

type ScopePrizesState = {
  catalog: SponsorPrizeSubmission[]
  submissions: SponsorPrizeSubmission[]
  loading: boolean
  error: string | null
}

export function useScopePrizes(includeOwn = false) {
  const { country, province } = useRegion()
  const { sport } = useSport()
  const [state, setState] = useState<ScopePrizesState>({
    catalog: [],
    submissions: [],
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams({
        country_id: country,
        province,
        sport_id: sport,
      })
      const response = await fetch(`/api/prizes?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const body = (await response.json()) as {
        catalog?: SponsorPrizeSubmission[]
        submissions?: SponsorPrizeSubmission[]
        error?: string
      }

      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudieron cargar los premios')
      }

      setState({
        catalog: body.catalog ?? [],
        submissions: includeOwn ? (body.submissions ?? []) : [],
        loading: false,
        error: null,
      })
    } catch (err) {
      setState({
        catalog: [],
        submissions: [],
        loading: false,
        error:
          err instanceof Error ? err.message : 'No se pudieron cargar los premios',
      })
    }
  }, [country, province, sport, includeOwn])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, refresh: load, country, province, sport }
}
