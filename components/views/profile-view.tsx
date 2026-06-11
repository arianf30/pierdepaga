'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { Player } from '@/lib/data'
import { PlayerProfileContent } from '@/components/profile/player-profile-content'
import { ProfileEditSheet } from '@/components/profile/profile-edit-sheet'
import { useUser } from '@/components/auth/user-provider'
import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'
import type { RankingBoardEntry } from '@/lib/types/ranking'
import type { MatchHistoryEntry } from '@/lib/supabase/partidos'
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
  const { sport } = useSport()
  const [editing, setEditing] = useState(false)
  const [editKey, setEditKey] = useState(0)
  const [saveNotice, setSaveNotice] = useState<SaveNotice | null>(null)

  const [ranking, setRanking] = useState<RankingBoardEntry | null>(null)
  const [rank, setRank] = useState<number | null>(null)
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([])

  const countryName = availableCountryById(country).name
  const regionLabel = `${countryName} · ${province}`

  const dismissNotice = useCallback(() => setSaveNotice(null), [])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  // Datos del ranking del scope activo (stats, récords, historial).
  useEffect(() => {
    if (!player.id || player.id === 'guest') return
    let active = true

    async function loadScopeData() {
      try {
        const params = new URLSearchParams({ country, province, sport })
        const response = await fetch(`/api/player/${player.id}?${params}`, {
          credentials: 'include',
          cache: 'no-store',
        })
        const body = (await response.json()) as {
          ranking?: RankingBoardEntry | null
          rank?: number | null
          matchHistory?: MatchHistoryEntry[]
        }
        if (!active || !response.ok) return
        setRanking(body.ranking ?? null)
        setRank(body.rank ?? null)
        setMatchHistory(body.matchHistory ?? [])
      } catch {
        if (active) {
          setRanking(null)
          setRank(null)
          setMatchHistory([])
        }
      }
    }

    void loadScopeData()
    return () => {
      active = false
    }
  }, [player.id, country, province, sport])

  const displayPlayer: Player = ranking
    ? {
        ...player,
        rank: rank ?? 0,
        rankDelta:
          ranking.ultima_posicion && rank
            ? ranking.ultima_posicion - rank
            : 0,
        wins: ranking.pg,
        losses: ranking.pp,
        streak: ranking.racha ? Number.parseInt(ranking.racha, 10) || 0 : 0,
        rating: ranking.habilidad ?? 0,
      }
    : player

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
        player={displayPlayer}
        profile={{
          firstName: profile.firstName,
          lastName: profile.lastName,
          displayName: profile.displayName,
          instagram: profile.instagram || undefined,
          avatar: profile.avatar || player.avatar,
        }}
        matchHistory={matchHistory}
        prizes={[]}
        regionLabel={regionLabel}
        rankingTitle={rankingTitle}
        performance={
          ranking
            ? {
                setsWon: ranking.sets_ganados,
                setsLost: ranking.sets_perdidos,
                gamesWon: ranking.games_ganados,
                gamesLost: ranking.games_perdidos,
              }
            : undefined
        }
        bestRecords={
          ranking
            ? {
                posicion: ranking.max_posicion,
                posicionFecha: ranking.max_posicion_fecha,
                habilidad: ranking.max_habilidad,
                habilidadFecha: ranking.max_habilidad_fecha,
                racha: ranking.max_racha,
                rachaFecha: ranking.max_racha_fecha,
              }
            : undefined
        }
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
