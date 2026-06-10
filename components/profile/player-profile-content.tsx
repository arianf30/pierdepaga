'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  AtSign,
  Flame,
  Gift,
  Pencil,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  PROFILE_MATCH_PREVIEW,
  type MatchRecord,
  type Player,
  type PublicPlayerProfile,
  type WonPrize,
} from '@/lib/data'
import { SectionTitle, fadeUp, GhostButton } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { formatSkill, playerSkill, SKILL_LABEL } from '@/lib/skill'

function MatchRow({
  match,
  index,
}: {
  match: MatchRecord
  index: number
}) {
  return (
    <motion.div
      {...fadeUp(index)}
      className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0"
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-lg font-display text-sm font-black',
          match.result === 'G'
            ? 'bg-primary/15 text-primary'
            : 'bg-destructive/15 text-destructive',
        )}
      >
        {match.result}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={match.avatar || '/placeholder.svg'}
        alt={match.opponent}
        className="size-9 rounded-lg object-cover ring-1 ring-border"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{match.opponent}</p>
        <p className="text-xs text-muted-foreground">{match.type}</p>
      </div>
      <div className="text-right">
        <p className="font-display text-sm font-bold tabular-nums">
          {match.score}
        </p>
        <p className="text-[11px] text-muted-foreground">{match.date}</p>
      </div>
    </motion.div>
  )
}

type PlayerProfileContentProps = {
  player: Player
  profile: PublicPlayerProfile['profile']
  matchHistory: MatchRecord[]
  prizes: WonPrize[]
  regionLabel: string
  rankingTitle: string
  readOnly?: boolean
  onEdit?: () => void
  onBack?: () => void
}

export function PlayerProfileContent({
  player,
  profile,
  matchHistory,
  prizes,
  regionLabel,
  rankingTitle,
  readOnly = false,
  onEdit,
  onBack,
}: PlayerProfileContentProps) {
  const [showAllMatches, setShowAllMatches] = useState(false)

  const totalMatches = player.wins + player.losses
  const winRate = Math.round((player.wins / totalMatches) * 100)
  const totalSets = profile.setsWon + profile.setsLost
  const setsWinRate = Math.round((profile.setsWon / totalSets) * 100)
  const totalGames = profile.gamesWon + profile.gamesLost
  const gamesWinRate = Math.round((profile.gamesWon / totalGames) * 100)
  const visibleMatches = showAllMatches
    ? matchHistory
    : matchHistory.slice(0, PROFILE_MATCH_PREVIEW)

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
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/40 sm:left-6 sm:top-6"
            >
              <ArrowLeft className="size-3.5" />
              Volver
            </button>
          )}

          {!readOnly && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/40 sm:right-6 sm:top-6"
            >
              <Pencil className="size-3.5" />
              Editar perfil
            </button>
          )}

          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar || player.avatar || '/placeholder.svg'}
              alt={player.name}
              className="size-28 rounded-2xl object-cover ring-2 ring-primary/60 ring-glow-energy sm:size-32"
            />
            <div className="flex-1 pb-1">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {regionLabel} · {rankingTitle} #{player.rank}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{player.handle}</p>
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
                >
                  <AtSign className="size-4" />
                  {profile.instagram.startsWith('@')
                    ? profile.instagram
                    : `@${profile.instagram}`}
                </a>
              )}
            </div>
            <div className="flex gap-2 pb-1">
              <div className="rounded-xl border border-border bg-card/70 px-4 py-2 text-center">
                <p className="font-display text-xl font-black text-accent tabular-nums text-glow-gold">
                  {formatSkill(playerSkill(player))}
                </p>
                <p className="type-label">{SKILL_LABEL}</p>
              </div>
              <div className="rounded-xl border border-border bg-card/70 px-4 py-2 text-center">
                <p className="inline-flex items-center gap-1 font-display text-xl font-black text-primary tabular-nums">
                  <Flame className="size-4" />
                  {player.streak > 0 ? `+${player.streak}` : player.streak}
                </p>
                <p className="type-label">Racha</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Partidos',
              value: totalMatches,
              tone: 'text-foreground',
              icon: Zap,
            },
            {
              label: 'Victorias totales',
              value: player.wins,
              tone: 'text-primary',
              icon: Trophy,
            },
            {
              label: 'Derrotas totales',
              value: player.losses,
              tone: 'text-destructive',
              icon: TrendingUp,
            },
            {
              label: 'Win rate',
              value: `${winRate}%`,
              tone: 'text-accent',
              icon: Target,
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(i)}
              className="rounded-2xl border border-border bg-card/60 p-4"
            >
              <s.icon className={cn('size-5', s.tone)} />
              <p
                className={cn(
                  'mt-3 font-display text-2xl font-black tabular-nums',
                  s.tone,
                )}
              >
                {s.value}
              </p>
              <p className="type-label text-[11px]">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Sets ganados',
              value: profile.setsWon,
              tone: 'text-primary',
            },
            {
              label: 'Sets perdidos',
              value: profile.setsLost,
              tone: 'text-destructive',
            },
            {
              label: 'Win rate',
              value: `${setsWinRate}%`,
              tone: 'text-accent',
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(i + 4)}
              className="rounded-2xl border border-border bg-card/60 p-4"
            >
              <p
                className={cn(
                  'font-display text-2xl font-black tabular-nums',
                  s.tone,
                )}
              >
                {s.value}
              </p>
              <p className="type-label mt-1 text-[11px]">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Games ganados',
              value: profile.gamesWon,
              tone: 'text-primary',
            },
            {
              label: 'Games perdidos',
              value: profile.gamesLost,
              tone: 'text-destructive',
            },
            {
              label: 'Win rate',
              value: `${gamesWinRate}%`,
              tone: 'text-accent',
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(i + 7)}
              className="rounded-2xl border border-border bg-card/60 p-4"
            >
              <p
                className={cn(
                  'font-display text-2xl font-black tabular-nums',
                  s.tone,
                )}
              >
                {s.value}
              </p>
              <p className="type-label mt-1 text-[11px]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <motion.section {...fadeUp(1)}>
            <SectionTitle
              kicker="Historial"
              title="Partidos jugados"
              action={
                matchHistory.length > PROFILE_MATCH_PREVIEW ? (
                  <GhostButton
                    type="button"
                    className="px-4 py-2 text-xs"
                    onClick={() => setShowAllMatches((v) => !v)}
                  >
                    {showAllMatches ? 'Ver menos' : 'Ver todos'}
                  </GhostButton>
                ) : undefined
              }
            />
            <div className="overflow-hidden rounded-2xl border border-border bg-card/50">
              {visibleMatches.length > 0 ? (
                visibleMatches.map((m, i) => (
                  <MatchRow key={m.id} match={m} index={i} />
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Sin partidos registrados todavía.
                </div>
              )}
            </div>
          </motion.section>
        </div>

        <motion.section {...fadeUp(2)}>
          <SectionTitle kicker="Recompensas" title="Premios conseguidos" />
          <div className="space-y-3">
            {prizes.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card/60 p-5 text-sm text-muted-foreground">
                {readOnly
                  ? 'Este jugador todavía no tiene premios.'
                  : 'Todavía no tenés premios. Competí y sumá rachas para desbloquearlos.'}
              </div>
            ) : (
              prizes.map((prize, i) => (
                <motion.div
                  key={prize.id}
                  {...fadeUp(i)}
                  className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
                    <Gift className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {prize.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {prize.detail}
                    </p>
                    {prize.sponsor && (
                      <p className="type-label mt-2 text-accent">
                        {prize.sponsor}
                      </p>
                    )}
                  </div>
                  <span className="type-label shrink-0 text-muted-foreground">
                    {prize.date}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
