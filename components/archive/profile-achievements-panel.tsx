'use client'

import { motion } from 'framer-motion'
import { Lock, Trophy } from 'lucide-react'
import { achievements } from '@/lib/data'
import { SectionTitle, fadeUp, rarityClasses } from '@/components/ui-kit'
import { cn } from '@/lib/utils'

/** Archivado: panel de logros / trofeos del perfil. */
export function ProfileAchievementsPanelArchive() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <SectionTitle kicker="Trofeos" title="Logros" />
      <div className="space-y-3">
        {achievements.map((a, i) => (
          <motion.div
            key={a.id}
            {...fadeUp(i)}
            className={cn(
              'flex items-center gap-3 rounded-2xl border bg-card/60 p-4',
              a.unlocked ? rarityClasses(a.rarity) : 'border-border opacity-60',
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
  )
}
