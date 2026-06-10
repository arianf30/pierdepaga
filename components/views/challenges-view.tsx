'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Swords, Flame, Crown, X, Search, Zap, Coins } from 'lucide-react'
import { challengers, type MatchType, type Player } from '@/lib/data'
import {
  fadeUp,
  statusColor,
  statusLabel,
  PrimaryButton,
  GhostButton,
} from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/auth/user-provider'

const matchTypes: MatchType[] = ['Partido simple', 'Desafío pierde paga']

const filters = ['Todos', 'En línea', 'Top 5', 'Rivales'] as const

export function ChallengesView() {
  const { player } = useUser()
  const [selected, setSelected] = useState<Player | null>(null)
  const [filter, setFilter] = useState<(typeof filters)[number]>('Todos')
  const [matchType, setMatchType] = useState<MatchType>('Desafío pierde paga')

  const list = challengers.filter((p) => {
    if (filter === 'En línea') return p.status !== 'offline'
    if (filter === 'Top 5') return p.rank <= 5
    if (filter === 'Rivales') return p.region === player.region
    return true
  })

  return (
    <div className="space-y-6 pb-10">
      <motion.div {...fadeUp(0)}>
        <p className="type-kicker">Elegí tu oponente</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">
          Arena de desafíos
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Elegí un rival, definí la apuesta y mandá tu desafío. Recordá la regla de
          oro: el que pierde, paga.
        </p>
      </motion.div>

      <motion.div {...fadeUp(1)} className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
          <Search className="size-4" />
          <input
            placeholder="Buscar rivales…"
            className="w-32 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none sm:w-44"
          />
        </div>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'type-label rounded-xl border px-4 py-2 text-xs transition-colors',
              filter === f
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p, i) => (
          <motion.button
            key={p.id}
            {...fadeUp(i)}
            whileHover={{ y: -6 }}
            onClick={() => setSelected(p)}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-5 text-left transition-colors hover:border-primary/40"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <span className="rounded-lg border border-border bg-secondary/60 px-2 py-1 font-display text-xs font-black text-muted-foreground">
                #{p.rank}
              </span>
              <span className="type-badge inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 font-medium text-muted-foreground">
                <span
                  className={cn('size-1.5 rounded-full', statusColor(p.status))}
                />
                {statusLabel(p.status)}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.avatar || '/placeholder.svg'}
                alt={p.name}
                className="size-20 rounded-2xl object-cover ring-1 ring-border transition-all group-hover:ring-2 group-hover:ring-primary/60"
              />
              <div>
                <p className="font-display text-lg font-bold leading-tight">
                  {p.name}
                </p>
                <p className="type-tag inline-flex items-center gap-1 text-accent">
                  <Crown className="size-3" /> {p.tier}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{p.handle}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              <div>
                <p className="font-display text-sm font-bold text-primary tabular-nums">
                  {p.wins}
                </p>
                <p className="type-label">Victorias</p>
              </div>
              <div>
                <p className="font-display text-sm font-bold tabular-nums">
                  {p.rating}
                </p>
                <p className="type-label">Rating</p>
              </div>
              <div>
                <p className="inline-flex items-center justify-center gap-1 font-display text-sm font-bold text-accent tabular-nums">
                  <Flame className="size-3" />
                  {p.streak}
                </p>
                <p className="type-label">Racha</p>
              </div>
            </div>

            <div className="type-tag mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Swords className="size-4" /> Desafiar
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border glass"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>

              <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-secondary/20 p-6">
                <div className="flex flex-col items-center text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={player.avatar || '/placeholder.svg'}
                    alt={player.name}
                    className="size-16 rounded-xl object-cover ring-2 ring-primary/50"
                  />
                  <p className="mt-2 text-sm font-bold">{player.name}</p>
                  <p className="type-tag text-[11px]">{player.tier}</p>
                </div>
                <div className="type-badge font-display text-2xl font-black text-accent text-glow-gold">
                  VS
                </div>
                <div className="flex flex-col items-center text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.avatar || '/placeholder.svg'}
                    alt={selected.name}
                    className="size-16 rounded-xl object-cover ring-2 ring-destructive/50"
                  />
                  <p className="mt-2 text-sm font-bold">{selected.name}</p>
                  <p className="type-tag text-[11px] text-accent">{selected.tier}</p>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <p className="type-label mb-2 text-[11px]">Tipo de partido</p>
                  <div className="grid grid-cols-2 gap-2">
                    {matchTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setMatchType(t)}
                        className={cn(
                          'rounded-xl border px-2 py-3 text-center text-xs font-bold transition-colors',
                          matchType === t
                            ? 'border-primary/50 bg-primary/15 text-primary'
                            : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {t === 'Partido simple' ? 'Simple' : 'Pierde paga'}
                      </button>
                    ))}
                  </div>
                </div>

                {matchType === 'Desafío pierde paga' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-3"
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
                      <Coins className="size-4" /> Apuesta en juego
                    </span>
                    <span className="font-display text-lg font-black text-accent">
                      $10.000
                    </span>
                  </motion.div>
                )}

                <div className="flex items-center gap-2 rounded-xl bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
                  <Zap className="size-4 text-primary" />
                  El ganador suma rating. El perdedor paga el precio. Sin revanchas
                  por 24 h.
                </div>

                <div className="flex gap-3">
                  <GhostButton
                    onClick={() => setSelected(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </GhostButton>
                  <PrimaryButton
                    onClick={() => setSelected(null)}
                    className="flex-1"
                  >
                    <Swords className="size-4" /> Enviar desafío
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
