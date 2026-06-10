'use client'

import { motion } from 'framer-motion'
import { Bell, Clock, Swords } from 'lucide-react'
import { incomingChallenges } from '@/lib/data'
import { SectionTitle, fadeUp } from '@/components/ui-kit'
import { formatSkill, playerSkill, SKILL_LABEL } from '@/lib/skill'

export function NotificationsView() {
  return (
    <div className="space-y-8 pb-10">
      <motion.div {...fadeUp(0)}>
        <p className="type-kicker">Bandeja</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">
          Notificaciones
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Desafíos entrantes, invitaciones y novedades de la arena.
        </p>
      </motion.div>

      <motion.section {...fadeUp(1)}>
        <SectionTitle
          kicker="Pendientes"
          title="Desafíos entrantes"
          action={
            <span className="type-badge inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
              <Bell className="size-3" />
              {incomingChallenges.length}
            </span>
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
                    #{c.player.rank} · {SKILL_LABEL}{' '}
                    {formatSkill(playerSkill(c.player))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-base font-extrabold text-accent">
                    {c.stake}
                  </p>
                  <p className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="size-3" /> Vence en {c.expires}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-4 py-2.5">
                <span className="type-tag inline-flex items-center gap-1 text-primary">
                  <Swords className="size-3" />
                  {c.matchType}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground transition-transform hover:scale-105"
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
