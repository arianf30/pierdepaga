'use client'

import { motion } from 'framer-motion'
import {
  Swords,
  Flame,
  TrendingUp,
  Trophy,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
} from 'lucide-react'
import { recentActivity, incomingChallenges, type View } from '@/lib/data'
import {
  SectionTitle,
  StatChip,
  PrimaryButton,
  GhostButton,
  fadeUp,
} from '@/components/ui-kit'
import { useUser } from '@/components/auth/user-provider'

export function HomeView({ setView }: { setView: (v: View) => void }) {
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
            alt="Arena competitiva de pádel PierdePaga"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative flex flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-12">
          <div className="max-w-xl">
            <motion.span
              {...fadeUp(1)}
              className="type-badge mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary"
            >
              <Flame className="size-3.5" /> Racha de {player.streak} victorias · El
              que pierde, paga
            </motion.span>
            <motion.h1
              {...fadeUp(2)}
              className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]"
            >
              Bienvenido de vuelta,
              <br />
              <span className="text-primary text-glow-energy">{player.name}</span>
            </motion.h1>
            <motion.p
              {...fadeUp(3)}
              className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground"
            >
              Estás en el puesto{' '}
              <span className="font-semibold text-accent">#{player.rank}</span> del
              ranking global en {player.tier}. Tres rivales esperan tu respuesta.
              Entrá a la cancha y hacelos pagar.
            </motion.p>

            <motion.div {...fadeUp(4)} className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => setView('challenges')}>
                <Swords className="size-4" /> Buscar rival
              </PrimaryButton>
              <GhostButton onClick={() => setView('ranking')}>
                <Trophy className="size-4" /> Ver ranking
              </GhostButton>
            </motion.div>
          </div>

          <motion.div
            {...fadeUp(3)}
            className="w-full max-w-sm rounded-2xl border border-border glass p-5 lg:w-80"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={player.avatar || '/placeholder.svg'}
                  alt={player.name}
                  className="size-16 rounded-xl object-cover ring-2 ring-primary/50"
                />
                <span className="type-badge absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-accent px-2 py-0.5 font-display font-bold text-accent-foreground">
                  Nv {player.level}
                </span>
              </div>
              <div>
                <p className="font-display text-lg font-semibold">{player.name}</p>
                <p className="text-xs text-muted-foreground">{player.handle}</p>
                <p className="type-tag mt-1 inline-flex items-center gap-1 text-accent">
                  <Crown className="size-3.5" /> {player.tier}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <StatChip label="Victorias" value={String(player.wins)} tone="win" />
              <StatChip label="Derrotas" value={String(player.losses)} tone="loss" />
              <StatChip label="Win %" value={`${winRate}`} tone="gold" />
            </div>
            <div className="mt-4">
              <div className="type-label mb-1.5 flex items-center justify-between text-[11px]">
                <span>Rating {player.rating}</span>
                <span>Próximo tier · {2500 - player.rating} pts</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(player.rating / 2500) * 100}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.section {...fadeUp(1)} className="lg:col-span-2">
          <SectionTitle kicker="Historial" title="Actividad reciente" />
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const isWin = a.type === 'win'
              const isLoss = a.type === 'loss'
              return (
                <motion.div
                  key={a.id}
                  {...fadeUp(i + 1)}
                  whileHover={{ x: 4 }}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/30"
                >
                  <div
                    className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                      isWin
                        ? 'bg-primary/15 text-primary'
                        : isLoss
                          ? 'bg-destructive/15 text-destructive'
                          : a.type === 'rank'
                            ? 'bg-accent/15 text-accent'
                            : 'bg-secondary text-foreground'
                    }`}
                  >
                    {isWin ? (
                      <ArrowUpRight className="size-5" />
                    ) : isLoss ? (
                      <ArrowDownRight className="size-5" />
                    ) : a.type === 'rank' ? (
                      <TrendingUp className="size-5" />
                    ) : (
                      <Swords className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.detail}
                    </p>
                  </div>
                  <div className="text-right">
                    {a.amount && (
                      <p
                        className={`font-display text-sm font-bold tabular-nums ${
                          a.amount.startsWith('+')
                            ? 'text-primary'
                            : 'text-destructive'
                        }`}
                      >
                        {a.amount}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        <motion.section {...fadeUp(2)}>
          <SectionTitle
            kicker="Entrantes"
            title="Desafíos"
            action={
              <button
                onClick={() => setView('challenges')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-accent"
              >
                Ver todos <ChevronRight className="size-3.5" />
              </button>
            }
          />
          <div className="space-y-3">
            {incomingChallenges.map((c, i) => (
              <motion.div
                key={c.id}
                {...fadeUp(i + 1)}
                className="overflow-hidden rounded-2xl border border-border bg-card/60"
              >
                <div className="flex items-center gap-3 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.player.avatar || '/placeholder.svg'}
                    alt={c.player.name}
                    className="size-12 rounded-xl object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {c.player.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.player.tier} · #{c.player.rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-extrabold text-accent">
                      {c.stake}
                    </p>
                    <p className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="size-3" /> {c.expires}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-4 py-2.5">
                  <span className="type-tag text-primary">{c.matchType}</span>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
                      Rechazar
                    </button>
                    <button className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition-transform hover:scale-105">
                      Aceptar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
