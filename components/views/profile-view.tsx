'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { matchHistory, wonPrizes } from '@/lib/data'
import { mergePlayerWithRanking } from '@/lib/ranking/map-player'
import { PlayerProfileContent } from '@/components/profile/player-profile-content'
import { ProfileEditSheet } from '@/components/profile/profile-edit-sheet'
import { useUser } from '@/components/auth/user-provider'
import { useRegion } from '@/components/region-provider'
import { useRanking } from '@/hooks/use-ranking'
import { availableCountryById, isCountryId } from '@/lib/catalog'
import { StatusBanner } from '@/components/ui/status-banner'

type SaveNotice = {
  type: 'success' | 'error'
  message: string
}

export function ProfileView() {
  const {
    player,
    profile,
    profileRow,
    updateProfile,
    refreshProfile,
    country,
    province,
    loading,
  } = useUser()
  const { rankingTitle, hydrateRegion } = useRegion()
  const { myRanking } = useRanking()
  const [editing, setEditing] = useState(false)
  const [editKey, setEditKey] = useState(0)
  const [saveNotice, setSaveNotice] = useState<SaveNotice | null>(null)

  const countryName = availableCountryById(country).name
  const regionLabel = `${countryName} · ${province}`
  const scopedPlayer = mergePlayerWithRanking(player, myRanking)

  const dismissNotice = useCallback(() => setSaveNotice(null), [])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  async function handleOpenEditor() {
    if (loading) return
    setSaveNotice(null)
    await refreshProfile()
    setEditKey((key) => key + 1)
    setEditing(true)
  }

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
    setSaveNotice({
      type: 'success',
      message: 'Perfil actualizado. Tus datos ya están guardados.',
    })
    return null
  }

  if (loading && !profileRow) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Cargando tu perfil…</p>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {saveNotice && (
          <div className="sticky top-0 z-30 mb-4">
            <StatusBanner
              type={saveNotice.type}
              message={saveNotice.message}
              onDismiss={dismissNotice}
            />
          </div>
        )}
      </AnimatePresence>

      <PlayerProfileContent
        player={scopedPlayer}
        profile={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          displayName: profile.displayName,
          instagram: profile.instagram || undefined,
          avatar: profile.avatar || player.avatar,
        }}
        matchHistory={matchHistory}
        prizes={wonPrizes}
        regionLabel={regionLabel}
        rankingTitle={rankingTitle}
        onEdit={() => void handleOpenEditor()}
        editDisabled={loading}
      />

      <ProfileEditSheet
        key={`${editKey}-${profileRow?.updated_at ?? 'sin-perfil'}`}
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
