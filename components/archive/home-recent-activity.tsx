'use client'

import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  Swords,
  TrendingUp,
} from 'lucide-react'
import { recentActivity } from '@/lib/data'
import { SectionTitle, fadeUp } from '@/components/ui-kit'

/** Archivado: feed de actividad reciente que vivía en Home. */
export function HomeRecentActivityArchive() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <SectionTitle kicker="Historial" title="Actividad reciente" />
      <div className="space-y-3">
        {recentActivity.map((a, i) => {
          const isWin = a.type === 'win'
          const isLoss = a.type === 'loss'
          return (
            <motion.div
              key={a.id}
              {...fadeUp(i + 1)}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4"
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
              <p className="text-[11px] text-muted-foreground">{a.time}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
