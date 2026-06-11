'use client'

import { PrizesView } from '@/components/views/prizes-view'
import { SponsorPrizesView } from '@/components/views/sponsor-prizes-view'
import { useUser } from '@/components/auth/user-provider'

export default function PremiosPage() {
  const { isSponsor, loading } = useUser()

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Cargando…
      </div>
    )
  }

  if (isSponsor) return <SponsorPrizesView />
  return <PrizesView />
}
