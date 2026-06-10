'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Clock } from 'lucide-react'
import { incomingChallenges } from '@/lib/data'
import { SectionTitle, fadeUp } from '@/components/ui-kit'

/** Archivado: panel de desafíos entrantes que vivía en Home. */
export function HomeIncomingChallengesArchive() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <SectionTitle
        kicker="Entrantes"
        title="Desafíos"
        action={
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Ver todos <ChevronRight className="size-3.5" />
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
                <p className="truncate text-sm font-semibold">{c.player.name}</p>
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
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
