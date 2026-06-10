'use client'

import { motion } from 'framer-motion'
import { Crown, Medal, Flame } from 'lucide-react'
import { leaderboard } from '@/lib/data'
import { cn } from '@/lib/utils'

function PodiumCard({
  player,
  place,
  delay,
}: {
  player: (typeof leaderboard)[number]
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
      <p className={cn('type-label mt-6 font-bold', config.labelColor)}>
        {config.label}
      </p>
      <p className="mt-1 font-display text-lg font-bold">{player.name}</p>
      <p className="mt-3 font-sans text-2xl font-bold tabular-nums text-foreground">
        {player.rating}
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

/** Archivado: podio diferenciado para el top 3 del ranking. */
export function RankingPodiumArchive() {
  const [first, second, third] = leaderboard

  return (
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
  )
}
