'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CirclePlus, Swords, Trophy } from 'lucide-react'
import type { Player } from '@/lib/data'
import { scheduledMatches } from '@/lib/data'
import type { PlayerLite } from '@/lib/supabase/partidos'
import { useRecentPartidos } from '@/hooks/use-recent-partidos'
import { routes } from '@/lib/routes'
import {
  SectionTitle,
  StatChip,
  AccentButton,
  PrimaryButton,
  GhostButton,
  fadeUp,
} from '@/components/ui-kit'
import { useUser } from '@/components/auth/user-provider'
import { useRegion } from '@/components/region-provider'
import { playerPublicName } from '@/lib/player-names'
import { formatSkill, playerSkill, SKILL_LABEL } from '@/lib/skill'
import {
  DoublesFaceoff,
  UpcomingDoublesCard,
} from '@/components/arena/doubles-faceoff'
import { LoadMatchModal } from '@/components/challenges/load-match-modal'
import { PierdePagaChallengeModal } from '@/components/challenges/pierde-paga-challenge-modal'

export function HomeView() {
  const router = useRouter()
  const [loadMatchOpen, setLoadMatchOpen] = useState(false)
  const [pierdePagaOpen, setPierdePagaOpen] = useState(false)
  const { player } = useUser()
  const { rankingTitle } = useRegion()
  const totalMatches = player.wins + player.losses
  const winRate =
    totalMatches > 0 ? Math.round((player.wins / totalMatches) * 100) : 0

  const { recientes, loading: recientesLoading } = useRecentPartidos()

  const recentFeed = useMemo(() => {
    const toPlayer = (p: PlayerLite): Player => ({
      id: p.id,
      name: p.name,
      displayName: p.name,
      handle: '',
      avatar: p.avatar || '/placeholder-user.jpg',
      rank: 0,
      rankDelta: 0,
      tier: '—',
      wins: 0,
      losses: 0,
      streak: 0,
      rating: 0,
      region: '',
      status: 'online',
    })

    return recientes.map((m) => ({
      id: m.id,
      teamA: [toPlayer(m.teamA[0]), toPlayer(m.teamA[1])] as [Player, Player],
      teamB: [toPlayer(m.teamB[0]), toPlayer(m.teamB[1])] as [Player, Player],
      winnerTeam: m.winnerTeam ?? undefined,
      score: m.score,
      time: m.date,
    }))
  }, [recientes])

  return (
    <div className="space-y-8 pb-10">
      <motion.section
        {...fadeUp(0)}
        className="relative overflow-hidden rounded-3xl border border-border"
      >
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/arena-hero.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative flex flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-12">
          <div className="max-w-xl">
            <motion.h1
              {...fadeUp(1)}
              className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]"
            >
              Bienvenido de vuelta,
              <br />
              <span className="text-primary text-glow-energy">
                {playerPublicName(player)}
              </span>
            </motion.h1>
            <motion.p
              {...fadeUp(2)}
              className="mt-3 text-sm text-muted-foreground"
            >
              #{player.rank} · {rankingTitle}
            </motion.p>

            <motion.div {...fadeUp(3)} className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => setLoadMatchOpen(true)}>
                <CirclePlus className="size-4" /> Partido Simple
              </PrimaryButton>
              <AccentButton onClick={() => setPierdePagaOpen(true)}>
                <Swords className="size-4" /> Pierde Paga
              </AccentButton>
              <GhostButton
                type="button"
                onClick={() => router.push(routes.ranking)}
              >
                <Trophy className="size-4" /> Ver ranking
              </GhostButton>
            </motion.div>
          </div>

          <motion.div
            {...fadeUp(2)}
            className="w-full max-w-sm rounded-2xl border border-border glass p-5 lg:w-80"
          >
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={player.avatar || '/placeholder.svg'}
                alt={playerPublicName(player)}
                className="size-16 rounded-xl object-cover ring-2 ring-primary/50"
              />
              <div>
                <p className="font-display text-lg font-semibold">
                  {playerPublicName(player)}
                </p>
                <p className="mt-1 font-display text-2xl font-black tabular-nums text-accent">
                  {formatSkill(playerSkill(player))}
                  <span className="type-label ml-1.5 text-[10px] font-medium text-muted-foreground">
                    {SKILL_LABEL}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <StatChip label="Victorias" value={String(player.wins)} tone="win" />
              <StatChip label="Derrotas" value={String(player.losses)} tone="loss" />
              <StatChip label="Win %" value={`${winRate}`} tone="gold" />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {scheduledMatches.length > 0 && (
        <motion.section {...fadeUp(1)}>
          <SectionTitle title="Próximos" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scheduledMatches.map((m, i) => (
              <motion.div key={m.id} {...fadeUp(i + 1)}>
                <UpcomingDoublesCard
                  teamA={m.teamA}
                  teamB={m.teamB}
                  scheduledAt={m.scheduledAt}
                  club={m.club}
                  type={m.type}
                  stake={m.stake}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section {...fadeUp(2)}>
        <SectionTitle title="Recientes" />
        {recientesLoading ? (
          <p className="text-sm text-muted-foreground">Cargando partidos…</p>
        ) : recentFeed.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground">
            Todavía no hay partidos jugados en este ranking.
          </p>
        ) : (
          <div className="space-y-3">
            {recentFeed.map((m, i) => (
              <motion.div key={m.id} {...fadeUp(i + 1)}>
                <DoublesFaceoff
                  teamA={m.teamA}
                  teamB={m.teamB}
                  winnerTeam={m.winnerTeam}
                  score={m.score}
                  time={m.time}
                  type="Partido simple"
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      <LoadMatchModal
        open={loadMatchOpen}
        onClose={() => setLoadMatchOpen(false)}
      />
      <PierdePagaChallengeModal
        open={pierdePagaOpen}
        onClose={() => setPierdePagaOpen(false)}
      />
    </div>
  )
}
