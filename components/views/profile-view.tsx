'use client'

import { useState } from 'react'
import { matchHistory, wonPrizes } from '@/lib/data'
import { PlayerProfileContent } from '@/components/profile/player-profile-content'
import { ProfileEditSheet } from '@/components/profile/profile-edit-sheet'
import { useUser } from '@/components/auth/user-provider'
import { useRegion } from '@/components/region-provider'
import { availableCountryById, isCountryId } from '@/lib/catalog'

export function ProfileView() {
  const { player, profile, updateProfile, country, province } = useUser()
  const { rankingTitle, hydrateRegion } = useRegion()
  const [editing, setEditing] = useState(false)

  const countryName = availableCountryById(country).name
  const regionLabel = `${countryName} · ${province}`

  async function handleSave({
    profile: nextProfile,
    country: nextCountry,
    province: nextProvince,
    avatarFile,
  }: {
    profile: typeof profile
    country: string
    province: string
    avatarFile?: File | null
  }) {
    const err = await updateProfile({
      profile: nextProfile,
      country: nextCountry,
      province: nextProvince,
      avatarFile,
    })
    if (err) return err
    if (!isCountryId(nextCountry)) return 'País no disponible.'
    hydrateRegion(nextCountry, nextProvince)
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
