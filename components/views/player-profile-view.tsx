'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Player } from '@/lib/data'
import { routes } from '@/lib/routes'
import { mapRankingEntryToPlayer } from '@/lib/ranking/map-ranking'
import type { RankingBoardEntry } from '@/lib/types/ranking'
import type { MatchHistoryEntry } from '@/lib/supabase/partidos'
import type { ProfileRow } from '@/lib/types/account'
import { PlayerProfileContent } from '@/components/profile/player-profile-content'
import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'

type PlayerApiResponse = {
  profile?: ProfileRow
  ranking?: RankingBoardEntry | null
  rank?: number | null
  matchHistory?: MatchHistoryEntry[]
  error?: string
}

function buildPlayerFromProfile(profile: ProfileRow): Player {
  const fullName = `${profile.first_name} ${profile.last_name}`.trim()
  const displayName = profile.display_name?.trim() || fullName || 'Jugador'

  return {
    id: profile.id,
    name: fullName || displayName,
    displayName,
    handle: `@${profile.id.slice(0, 8)}`,
    avatar: profile.avatar_url || '/placeholder-user.jpg',
    rank: 0,
    rankDelta: 0,
    tier: '—',
    wins: 0,
    losses: 0,
    streak: 0,
    rating: 0,
    region: profile.province,
    status: 'online',
  }
}

export function PlayerProfileView({ playerId }: { playerId: string }) {
  const router = useRouter()
  const { country, province, rankingTitle } = useRegion()
  const { sport } = useSport()

  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [ranking, setRanking] = useState<RankingBoardEntry | null>(null)
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function handleBack() {
    router.push(routes.ranking)
  }

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ country, province, sport })
        const response = await fetch(`/api/player/${playerId}?${params}`, {
          credentials: 'include',
          cache: 'no-store',
        })
        const body = (await response.json()) as PlayerApiResponse

        if (!response.ok || !body.profile) {
          throw new Error(body.error ?? 'No se pudo cargar el jugador')
        }

        if (!active) return

        const builtPlayer = body.ranking
          ? mapRankingEntryToPlayer(body.ranking, (body.rank ?? 1) - 1, province)
          : buildPlayerFromProfile(body.profile)

        setProfile(body.profile)
        setPlayer(builtPlayer)
        setRanking(body.ranking ?? null)
        setMatchHistory(body.matchHistory ?? [])
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error ? err.message : 'No se pudo cargar el jugador',
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [playerId, country, province, sport])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 px-5 py-12 text-center text-sm text-muted-foreground">
        Cargando jugador…
      </div>
    )
  }

  if (error || !profile || !player) {
    return (
      <div className="rounded-2xl border border-border bg-card/60 px-5 py-12 text-center">
        <p className="text-sm font-medium text-foreground">
          No encontramos este jugador
        </p>
        {error && <p className="mt-1 text-xs text-muted-foreground">{error}</p>}
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
      player={player}
      profile={{
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: profile.display_name,
        instagram: profile.instagram?.trim() || undefined,
        avatar: profile.avatar_url || player.avatar,
      }}
      matchHistory={matchHistory}
      prizes={[]}
      regionLabel={profile.province}
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
      readOnly
      onBack={handleBack}
    />
  )
}
