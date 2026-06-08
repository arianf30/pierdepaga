'use client'

import { motion } from 'framer-motion'
import { Crown, Medal, Flame, TrendingUp, Minus, Swords } from 'lucide-react'
import { leaderboard, type Player, type View } from '@/lib/data'
import { SectionTitle, fadeUp, statusColor } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/auth/user-provider'

function PodiumCard({
  player,
  place,
  delay,
}: {
  player: Player
  place: 1 | 2 | 3
  delay: number
}) {
  const config = {
    1: {
      h: 'lg:mt-0',
      ring: 'ring-glow-gold ring-2 ring-accent/60',
      badge: 'bg-accent text-accent-foreground',
      icon: <Crown className="size-5" />,
      glow: 'from-accent/25',
      label: 'Campeón',
      labelColor: 'text-accent',
    },
    2: {
      h: 'lg:mt-10',
      ring: 'ring-1 ring-primary/40',
      badge: 'bg-primary text-primary-foreground',
      icon: <Medal className="size-5" />,
      glow: 'from-primary/15',
      label: 'Subcampeón',
      labelColor: 'text-primary',
    },
    3: {
      h: 'lg:mt-16',
      ring: 'ring-1 ring-border',
      badge: 'bg-secondary text-foreground',
      icon: <Medal className="size-5" />,
      glow: 'from-muted/10',
      label: 'Tercero',
      labelColor: 'text-muted-foreground',
    },
  }[place]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border bg-card/70 p-6 text-center',
        config.h,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent',
          config.glow,
        )}
      />
      <div
        className={cn(
          'mx-auto grid size-8 place-items-center rounded-full font-display text-sm font-black',
          config.badge,
        )}
      >
        {place}
      </div>
      <div className="relative mx-auto mt-4 w-fit">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={player.avatar || '/placeholder.svg'}
          alt={player.name}
          className={cn('size-24 rounded-2xl object-cover', config.ring)}
        />
        <span
          className={cn(
            'absolute -bottom-3 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full',
            config.badge,
          )}
        >
          {config.icon}
        </span>
      </div>
      <p
        className={cn(
          'type-label mt-6 font-bold',
          config.labelColor,
        )}
      >
        {config.label}
      </p>
      <p className="mt-1 font-display text-lg font-bold">{player.name}</p>
      <p className="type-tag text-muted-foreground">{player.tier}</p>
      <p className="mt-3 font-sans text-2xl font-bold tabular-nums text-foreground">
        {player.rating}
        <span className="type-label ml-1 text-xs">RP</span>
      </p>
      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <span className="text-primary">{player.wins}G</span>
        <span className="text-destructive">{player.losses}P</span>
        <span className="inline-flex items-center gap-1 text-accent">
          <Flame className="size-3" />
          {player.streak}
        </span>
      </div>
    </motion.div>
  )
}

export function RankingView({ setView }: { setView: (v: View) => void }) {
  const { player } = useUser()
  const [first, second, third] = leaderboard
  const rest = leaderboard.slice(3)

  return (
    <div className="space-y-8 pb-10">
      <motion.div {...fadeUp(0)}>
        <p className="type-kicker">Temporada 4 · Ranking global</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">
          Ranking global
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          La élite del pádel competitivo. Solo las victorias te hacen subir. Cada
          derrota te acerca a quienes te persiguen.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="order-2 sm:order-1">
          <PodiumCard player={second} place={2} delay={0.15} />
        </div>
        <div className="order-1 sm:order-2">
          <PodiumCard player={first} place={1} delay={0.05} />
        </div>
        <div className="order-3">
          <PodiumCard player={third} place={3} delay={0.25} />
        </div>
      </div>

      <motion.section {...fadeUp(1)}>
        <SectionTitle kicker="Posiciones 4+" title="Tabla general" />
        <div className="overflow-hidden rounded-2xl border border-border bg-card/50">
          <div className="type-label hidden grid-cols-[60px_1fr_120px_120px_100px] gap-4 border-b border-border px-5 py-3 sm:grid">
            <span>Puesto</span>
            <span>Jugador</span>
            <span className="text-center">Récord</span>
            <span className="text-center">Racha</span>
            <span className="text-right">Rating</span>
          </div>
          {rest.map((p, i) => {
            const isMe = p.handle === player.handle || p.name === player.name
            return (
              <motion.div
                key={p.id}
                {...fadeUp(i + 1)}
                whileHover={{
                  backgroundColor:
                    'color-mix(in oklch, var(--secondary) 50%, transparent)',
                }}
                className={cn(
                  'grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b border-border px-4 py-3.5 last:border-0 sm:grid-cols-[60px_1fr_120px_120px_100px] sm:gap-4 sm:px-5',
                  isMe && 'bg-primary/10',
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="font-display text-lg font-bold tabular-nums text-muted-foreground">
                    {p.rank}
                  </span>
                  {i % 3 === 0 ? (
                    <TrendingUp className="size-3 text-primary" />
                  ) : i % 3 === 1 ? (
                    <Minus className="size-3 text-muted-foreground" />
                  ) : (
                    <TrendingUp className="size-3 rotate-180 text-destructive" />
                  )}
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.avatar || '/placeholder.svg'}
                      alt={p.name}
                      className="size-10 rounded-lg object-cover ring-1 ring-border"
                    />
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card',
                        statusColor(p.status),
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {p.name}
                      {isMe && (
                        <span className="type-badge ml-2 rounded bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">
                          Vos
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.tier} · {p.region}
                    </p>
                  </div>
                </div>

                <div className="hidden text-center text-sm sm:block">
                  <span className="text-primary">{p.wins}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-destructive">{p.losses}</span>
                </div>

                <div className="hidden items-center justify-center gap-1 text-sm text-accent sm:flex">
                  <Flame className="size-3.5" />
                  {p.streak}
                </div>

                <div className="text-right">
                  <span className="font-display text-base font-extrabold tabular-nums">
                    {p.rating}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-center">
          <motion.button
            {...fadeUp(2)}
            onClick={() => setView('challenges')}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-3 font-display text-sm font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <Swords className="size-4" /> Desafiar a un rival
          </motion.button>
        </div>
      </motion.section>
    </div>
  )
}
