'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AnnualPrizeCard,
  StreakPrizeCard,
} from '@/components/prizes/prize-catalog-cards'
import { prizeScopeLabel } from '@/lib/prizes/scope-label'
import {
  mapSubmissionToAnnualPrize,
  mapSubmissionToStreakPrize,
} from '@/lib/prizes/map-submission'
import {
  hasVisibleCatalogPrizes,
  pickRankingCatalogPrize,
  pickStreakCatalogPrize,
} from '@/lib/prizes/pick-catalog-prize'
import { useScopePrizes } from '@/hooks/use-scope-prizes'
import { POSITIVE_STREAK_MILESTONES } from '@/lib/streaks'
import { SectionTitle, fadeUp } from '@/components/ui-kit'

export function PrizesView() {
  const { catalog, loading, error, country, province, sport } = useScopePrizes()
  const scopeLabel = prizeScopeLabel(country, province, sport)

  const rankingPrizes = useMemo(
    () =>
      ([1, 2, 3] as const)
        .map((position) => pickRankingCatalogPrize(catalog, position))
        .filter(Boolean)
        .map((item) => mapSubmissionToAnnualPrize(item!))
        .sort((a, b) => a.position - b.position),
    [catalog],
  )

  const streakPrizes = useMemo(
    () =>
      POSITIVE_STREAK_MILESTONES.map((milestone) =>
        pickStreakCatalogPrize(catalog, milestone),
      )
        .filter(Boolean)
        .map((item) => mapSubmissionToStreakPrize(item!))
        .sort((a, b) => a.milestone - b.milestone),
    [catalog],
  )

  const podiumOrder: (1 | 2 | 3)[] = [2, 1, 3]
  const hasAnyPrizes = hasVisibleCatalogPrizes(catalog)

  return (
    <div className="space-y-10 pb-10">
      <motion.div {...fadeUp(0)}>
        <p className="type-kicker">Recompensas</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">
          Premios
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Premios del podio regional — una entrega por año — y recompensas por
          racha positiva en tu región.
        </p>
        <p className="mt-2 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {scopeLabel}
        </p>
      </motion.div>

      {loading && (
        <p className="text-sm text-muted-foreground">Cargando premios…</p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {!loading && !error && !hasAnyPrizes && (
        <motion.div
          {...fadeUp(1)}
          className="rounded-2xl border border-border bg-card/40 px-5 py-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Todavía no hay premios activos en {scopeLabel}.
          </p>
        </motion.div>
      )}

      {!loading && rankingPrizes.length > 0 && (
        <motion.section {...fadeUp(1)}>
          <SectionTitle kicker="Anual" title="Top 3 regional" />
          <p className="-mt-2 mb-4 text-xs text-muted-foreground">
            Se entregan una vez al año a los tres primeros del ranking regional.
          </p>
          <div className="grid items-end gap-4 sm:grid-cols-3">
            {podiumOrder
              .map((position) =>
                rankingPrizes.find((prize) => prize.position === position),
              )
              .filter(Boolean)
              .map((prize) => (
                <AnnualPrizeCard key={prize!.id} prize={prize!} />
              ))}
          </div>
        </motion.section>
      )}

      {!loading && streakPrizes.length > 0 && (
        <motion.section {...fadeUp(2)}>
          <SectionTitle kicker="Rachas" title="Premios por racha positiva" />
          <p className="-mt-2 mb-4 text-xs text-muted-foreground">
            Cada hito de victorias consecutivas activa un premio patrocinado.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {streakPrizes.map((prize, i) => (
              <StreakPrizeCard key={prize.id} prize={prize} index={i} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}
