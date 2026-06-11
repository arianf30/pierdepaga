'use client'

import { motion } from 'framer-motion'
import { Crown, Flame, Gift } from 'lucide-react'
import {
  annualRankingPrizes,
  streakCatalogPrizes,
  type AnnualRankingPrize,
  type StreakCatalogPrize,
} from '@/lib/data'
import { SectionTitle, fadeUp } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { formatStreakValue } from '@/lib/streaks'

function PrizeCover({
  image,
  alt,
  className,
  fallbackTone = 'energy',
}: {
  image?: string
  alt: string
  className?: string
  fallbackTone?: 'energy' | 'gold' | 'muted'
}) {
  const fallbackClass =
    fallbackTone === 'gold'
      ? 'from-accent/20 via-card to-card'
      : fallbackTone === 'muted'
        ? 'from-secondary via-card to-card'
        : 'from-primary/20 via-card to-card'

  return (
    <div
      className={cn(
        'relative aspect-[16/10] overflow-hidden bg-card',
        className,
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center bg-gradient-to-br',
            fallbackClass,
          )}
        >
          <Gift className="size-10 text-muted-foreground/25" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />
    </div>
  )
}

function AnnualPrizeCard({ prize }: { prize: AnnualRankingPrize }) {
  const isFirst = prize.position === 1

  return (
    <motion.article
      {...fadeUp(prize.position)}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border bg-card/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors',
        isFirst
          ? 'border-accent/30 ring-1 ring-accent/15 lg:-mt-3'
          : 'border-border hover:border-primary/20',
      )}
    >
      <PrizeCover
        image={prize.image}
        alt={prize.title}
        fallbackTone={isFirst ? 'gold' : prize.position === 2 ? 'energy' : 'muted'}
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span
            className={cn(
              'type-badge inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px]',
              isFirst
                ? 'bg-accent/15 text-accent'
                : prize.position === 2
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary text-muted-foreground',
            )}
          >
            {isFirst && <Crown className="size-3" />}
            Puesto #{prize.position}
          </span>
          <span className="type-label text-[9px]">1 vez al año</span>
        </div>

        <h3 className="mt-3 font-display text-base font-bold leading-tight text-foreground">
          {prize.title}
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="type-label text-[9px]">Anunciante</span>
          <br />
          <span className="font-medium text-foreground/90">{prize.sponsor}</span>
        </p>
      </div>
    </motion.article>
  )
}

function StreakPrizeCard({
  prize,
  index,
}: {
  prize: StreakCatalogPrize
  index: number
}) {
  const tierGlow =
    prize.milestone >= 14
      ? 'border-accent/25'
      : prize.milestone >= 8
        ? 'border-primary/20'
        : 'border-border'

  return (
    <motion.article
      {...fadeUp(index + 4)}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border bg-card/60 transition-colors hover:border-primary/25',
        tierGlow,
      )}
    >
      <PrizeCover image={prize.image} alt={prize.title} />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="type-badge inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-[9px] text-accent">
            <Flame className="size-3" />
            Racha {formatStreakValue(prize.milestone)}
          </span>
          <span className="font-display text-xs font-bold tabular-nums text-muted-foreground">
            {prize.deliveredCount.toLocaleString('es-AR')} entregados
          </span>
        </div>

        <h3 className="mt-3 font-display text-sm font-bold leading-tight text-foreground">
          {prize.title}
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="type-label text-[9px]">Anunciante</span>
          <br />
          <span className="font-medium text-foreground/90">{prize.sponsor}</span>
        </p>
      </div>
    </motion.article>
  )
}

export function PrizesView() {
  const podiumOrder: (1 | 2 | 3)[] = [2, 1, 3]

  return (
    <div className="space-y-10 pb-10">
      <motion.div {...fadeUp(0)}>
        <p className="type-kicker">Recompensas</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">
          Premios
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Premios del podio regional — una entrega por año — y recompensas por
          racha positiva que se van desbloqueando en la arena.
        </p>
      </motion.div>

      <motion.section {...fadeUp(1)}>
        <SectionTitle
          kicker="Anual"
          title="Top 3 regional"
        />
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">
          Se entregan una vez al año a los tres primeros del ranking regional.
        </p>
        <div className="grid items-end gap-4 sm:grid-cols-3">
          {podiumOrder.map((position) => {
            const prize = annualRankingPrizes.find(
              (p) => p.position === position,
            )!
            return <AnnualPrizeCard key={prize.id} prize={prize} />
          })}
        </div>
      </motion.section>

      <motion.section {...fadeUp(2)}>
        <SectionTitle
          kicker="Rachas"
          title="Premios por racha positiva"
        />
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">
          Cada hito de victorias consecutivas activa un premio patrocinado.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {streakCatalogPrizes.map((prize, i) => (
            <StreakPrizeCard key={prize.id} prize={prize} index={i} />
          ))}
        </div>
      </motion.section>
    </div>
  )
}
