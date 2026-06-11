'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@/components/auth/user-provider'
import { useRegion } from '@/components/region-provider'

/** Sincroniza país/provincia del perfil Supabase con el selector global. */
export function RegionSync() {
  const { user, country, province, loading } = useUser()
  const { hydrateRegion } = useRegion()
  const synced = useRef(false)

  useEffect(() => {
    if (!user) {
      synced.current = false
      return
    }
    if (loading || synced.current) return
    hydrateRegion(country, province)
    synced.current = true
  }, [user, loading, country, province, hydrateRegion])

  return null
}
