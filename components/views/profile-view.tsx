'use client'

import { useState } from 'react'
import { matchHistory, wonPrizes } from '@/lib/data'
import { PlayerProfileContent } from '@/components/profile/player-profile-content'
import { ProfileEditSheet } from '@/components/profile/profile-edit-sheet'
import { useUser } from '@/components/auth/user-provider'
import { useRegion } from '@/components/region-provider'
import { COUNTRIES } from '@/lib/regions'

export function ProfileView() {
  const { player, profile, updateProfile } = useUser()
  const { country, province, setCountry, setProvince, rankingTitle } =
    useRegion()
  const [editing, setEditing] = useState(false)

  const countryName = COUNTRIES.find((c) => c.id === country)?.name ?? ''
  const regionLabel = `${countryName} · ${province}`

  function handleSave({
    profile: nextProfile,
    country: nextCountry,
    province: nextProvince,
  }: {
    profile: typeof profile
    country: string
    province: string
  }) {
    const err = updateProfile(nextProfile)
    if (err) return err
    setCountry(nextCountry as 'ar' | 'py')
    setProvince(nextProvince)
    return null
  }

  return (
    <>
      <PlayerProfileContent
        player={player}
        profile={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          displayName: profile.displayName,
          instagram: profile.instagram || undefined,
          avatar: profile.avatar || player.avatar,
          setsWon: profile.setsWon,
          setsLost: profile.setsLost,
          gamesWon: profile.gamesWon,
          gamesLost: profile.gamesLost,
        }}
        matchHistory={matchHistory}
        prizes={wonPrizes}
        regionLabel={regionLabel}
        rankingTitle={rankingTitle}
        onEdit={() => setEditing(true)}
      />

      <ProfileEditSheet
        open={editing}
        profile={profile}
        country={country}
        province={province}
        onClose={() => setEditing(false)}
        onSave={handleSave}
      />
    </>
  )
}
