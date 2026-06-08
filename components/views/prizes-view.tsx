'use client'

import { motion } from 'framer-motion'
import { Lock, Medal, Trophy } from 'lucide-react'
import { achievements } from '@/lib/data'
import { SectionTitle, fadeUp, rarityClasses } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/auth/user-provider'

export function PrizesView() {
  const { player } = useUser()
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-8 pb-10">
      <motion.div {...fadeUp(0)}>
        <p className="type-kicker">Recompensas</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">
          Premios y logros
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Desbloqueá trofeos, insignias y recompensas exclusivas compitiendo en
          la arena. Cada victoria te acerca al siguiente premio.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Desbloqueados', value: unlocked, tone: 'text-primary' },
          {
            label: 'Por conseguir',
            value: achievements.length - unlocked,
            tone: 'text-muted-foreground',
          },
          { label: 'Nivel', value: player.level, tone: 'text-accent' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            {...fadeUp(i + 1)}
            className="rounded-2xl border border-border bg-card/60 p-5"
          >
            <p className={cn('font-display text-3xl font-black tabular-nums', s.tone)}>
              {s.value}
            </p>
            <p className="type-label mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.section {...fadeUp(2)}>
        <SectionTitle kicker="Colección" title="Todos los premios" />
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              {...fadeUp(i + 1)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border bg-card/60 p-4',
                a.unlocked ? rarityClasses(a.rarity) : 'border-border opacity-60',
              )}
            >
              <div
                className={cn(
                  'grid size-12 shrink-0 place-items-center rounded-xl border',
                  a.unlocked
                    ? 'border-current bg-current/10'
                    : 'border-border bg-secondary',
                )}
              >
                {a.unlocked ? (
                  <Medal className="size-5" />
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

      <motion.div
        {...fadeUp(3)}
        className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/10 p-5"
      >
        <Trophy className="size-8 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Temporada 4 · Premios activos
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Los premios de temporada se renuevan cada ciclo. Seguí compitiendo
            para mantener tu colección al día.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
