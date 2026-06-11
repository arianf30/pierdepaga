'use client'

import { useRouter } from 'next/navigation'
import { getPublicPlayerProfile } from '@/lib/data'
import { routes } from '@/lib/routes'
import { PlayerProfileContent } from '@/components/profile/player-profile-content'
import { useRegion } from '@/components/region-provider'

export function PlayerProfileView({
  playerId,
}: {
  playerId: string
}) {
  const router = useRouter()
  const { rankingTitle } = useRegion()

  function handleBack() {
    router.push(routes.ranking)
  }
  const data = getPublicPlayerProfile(playerId)

  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 px-5 py-12 text-center">
        <p className="text-sm font-medium text-foreground">
          No encontramos este jugador
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 text-sm font-semibold text-primary hover:text-primary/80"
        >
          Volver al ranking
        </button>
      </div>
    )
  }

  return (
    <PlayerProfileContent
      player={data.player}
      profile={data.profile}
      matchHistory={data.matchHistory}
      prizes={data.prizes}
      regionLabel={data.regionLabel}
      rankingTitle={rankingTitle}
      readOnly
      onBack={handleBack}
    />
  )
}
