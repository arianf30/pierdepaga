'use client'

import { motion } from 'framer-motion'
import {
  Crown,
  Flame,
  Lock,
  Trophy,
  Target,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react'
import { achievements, matchHistory } from '@/lib/data'
import { SectionTitle, fadeUp, rarityClasses } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/auth/user-provider'

const performance = [
  { label: 'Ataque', value: 88, icon: Zap },
  { label: 'Defensa', value: 74, icon: Shield },
  { label: 'Consistencia', value: 81, icon: Target },
  { label: 'Presión', value: 92, icon: Flame },
]

export function ProfileView() {
  const { player } = useUser()
  const winRate = Math.round(
    (player.wins / (player.wins + player.losses)) * 100,
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
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        </div>
        <div className="relative flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:items-end sm:text-left sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={player.avatar || '/placeholder.svg'}
            alt={player.name}
            className="size-28 rounded-2xl object-cover ring-2 ring-primary/60 ring-glow-energy sm:size-32"
          />
          <div className="flex-1 pb-1">
            <p className="type-tag inline-flex items-center gap-1.5 text-accent">
              <Crown className="size-4" /> {player.tier}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {player.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {player.handle} · {player.region} · Global #{player.rank}
            </p>
          </div>
          <div className="flex gap-2 pb-1">
            <div className="rounded-xl border border-border bg-card/70 px-4 py-2 text-center">
              <p className="font-display text-xl font-black text-accent tabular-nums">
                {player.rating}
              </p>
              <p className="type-label">Rating</p>
            </div>
            <div className="rounded-xl border border-border bg-card/70 px-4 py-2 text-center">
              <p className="inline-flex items-center gap-1 font-display text-xl font-black text-primary tabular-nums">
                <Flame className="size-4" />
                {player.streak}
              </p>
              <p className="type-label">Racha</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
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
          {
            label: 'Partidos',
            value: player.wins + player.losses,
            tone: 'text-foreground',
            icon: Zap,
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <motion.section {...fadeUp(1)}>
            <SectionTitle kicker="Estilo de juego" title="Métricas de rendimiento" />
            <div className="grid gap-4 rounded-2xl border border-border bg-card/60 p-5 sm:grid-cols-2">
              {performance.map((m, i) => (
                <div key={m.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      <m.icon className="size-4 text-primary" />
                      {m.label}
                    </span>
                    <span className="font-display text-sm font-bold tabular-nums text-foreground">
                      {m.value}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.value}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.9,
                        delay: i * 0.1,
                        ease: 'easeOut',
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section {...fadeUp(2)}>
            <SectionTitle kicker="Historial" title="Partidos jugados" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card/50">
              {matchHistory.map((m, i) => (
                <motion.div
                  key={m.id}
                  {...fadeUp(i)}
                  className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0"
                >
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-lg font-display text-sm font-black',
                      m.result === 'G'
                        ? 'bg-primary/15 text-primary'
                        : 'bg-destructive/15 text-destructive',
                    )}
                  >
                    {m.result}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.avatar || '/placeholder.svg'}
                    alt={m.opponent}
                    className="size-9 rounded-lg object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.opponent}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.type === 'Normal'
                        ? 'Partido normal'
                        : m.type === 'Desafío'
                          ? 'Partido desafío'
                          : 'Pierde paga'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold tabular-nums">
                      {m.score}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{m.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        <motion.section {...fadeUp(3)}>
          <SectionTitle kicker="Trofeos" title="Logros" />
          <div className="space-y-3">
            {achievements.map((a, i) => (
              <motion.div
                key={a.id}
                {...fadeUp(i)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border bg-card/60 p-4',
                  a.unlocked
                    ? rarityClasses(a.rarity)
                    : 'border-border opacity-60',
                )}
              >
                <div
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-xl border',
                    a.unlocked
                      ? 'border-current bg-current/10'
                      : 'border-border bg-secondary',
                  )}
                >
                  {a.unlocked ? (
                    <Trophy className="size-5" />
                  ) : (
                    <Lock className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {a.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.detail}
                  </p>
                </div>
                <span className="type-label shrink-0 font-bold">{a.rarity}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
