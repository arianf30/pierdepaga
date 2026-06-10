'use client'

import { motion } from 'framer-motion'
import { Flame, Shield, Target, Zap } from 'lucide-react'
import { SectionTitle } from '@/components/ui-kit'

const performance = [
  { label: 'Ataque', value: 88, icon: Zap },
  { label: 'Defensa', value: 74, icon: Shield },
  { label: 'Consistencia', value: 81, icon: Target },
  { label: 'Presión', value: 92, icon: Flame },
]

/** Archivado: métricas de rendimiento del perfil (sin datos reales por ahora). */
export function ProfilePerformanceMetricsArchive() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
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
                animate={{ width: `${m.value}%` }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
