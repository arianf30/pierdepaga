'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Swords, Trophy } from 'lucide-react'
import {
  buildArenaFeed,
  isHighStakesMatch,
  playedDoublesMatches,
  scheduledMatches,
  type View,
} from '@/lib/data'
import {
  SectionTitle,
  StatChip,
  PrimaryButton,
  GhostButton,
  fadeUp,
} from '@/components/ui-kit'
import { useUser } from '@/components/auth/user-provider'
import { useRegion } from '@/components/region-provider'
import { formatSkill, playerSkill, SKILL_LABEL } from '@/lib/skill'
import {
  DoublesFaceoff,
  UpcomingDoublesCard,
} from '@/components/arena/doubles-faceoff'

export function HomeView({ setView }: { setView: (v: View) => void }) {
  const { player } = useUser()
  const { rankingTitle } = useRegion()
  const winRate = Math.round(
    (player.wins / (player.wins + player.losses)) * 100,
  )

  const recentFeed = useMemo(
    () => buildArenaFeed(playedDoublesMatches).slice(0, 6),
    [],
  )

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
              <span className="text-primary text-glow-energy">{player.name}</span>
            </motion.h1>
            <motion.p
              {...fadeUp(2)}
              className="mt-3 text-sm text-muted-foreground"
            >
              #{player.rank} · {rankingTitle}
            </motion.p>

            <motion.div {...fadeUp(3)} className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => setView('challenges')}>
                <Swords className="size-4" /> Buscar rival
              </PrimaryButton>
              <GhostButton onClick={() => setView('ranking')}>
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
                alt={player.name}
                className="size-16 rounded-xl object-cover ring-2 ring-primary/50"
              />
              <div>
                <p className="font-display text-lg font-semibold">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.handle}</p>
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
        <SectionTitle
          title="Recientes"
          action={
            <button
              type="button"
              onClick={() => setView('ranking')}
              className="text-xs font-semibold text-primary transition-colors hover:text-accent"
            >
              Ver ranking
            </button>
          }
        />
        <div className="space-y-3">
          {recentFeed.map((m, i) => (
            <motion.div key={m.id} {...fadeUp(i + 1)}>
              <DoublesFaceoff
                teamA={m.teamA}
                teamB={m.teamB}
                winnerTeam={m.winnerTeam}
                score={m.score}
                time={m.time}
                type={m.type}
                stake={m.stake}
                highlight={isHighStakesMatch(m)}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
