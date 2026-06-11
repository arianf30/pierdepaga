'use client'

import { motion } from 'framer-motion'
import { Crown, Flame, Gift } from 'lucide-react'
import type { AnnualRankingPrize, StreakCatalogPrize } from '@/lib/data'
import { fadeUp } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { formatStreakValue } from '@/lib/streaks'

function PrizeStatusBadge({ status }: { status?: 'pending' | 'approved' }) {
  if (status === 'pending') {
    return (
      <span className="type-badge rounded-full border border-accent/35 bg-accent/10 px-2 py-0.5 text-[9px] text-accent">
        Pendiente
      </span>
    )
  }

  if (status === 'approved') {
    return (
      <span className="type-badge rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] text-primary">
        Verificado
      </span>
    )
  }

  return null
}

export function PrizeCover({
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

export function AnnualPrizeCard({
  prize,
  action,
}: {
  prize: AnnualRankingPrize
  action?: React.ReactNode
}) {
  const isFirst = prize.position === 1
  const isPending = prize.status === 'pending'

  return (
    <motion.article
      {...fadeUp(prize.position)}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border bg-card/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors',
        isPending && 'border-accent/25 opacity-95',
        !isPending &&
          (isFirst
            ? 'border-accent/30 ring-1 ring-accent/15 lg:-mt-3'
            : 'border-border hover:border-primary/20'),
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
          <div className="flex flex-col items-end gap-1">
            <PrizeStatusBadge status={prize.status} />
            <span className="type-label text-[9px]">1 vez al año</span>
          </div>
        </div>

        <h3 className="mt-3 font-display text-base font-bold leading-tight text-foreground">
          {prize.title}
        </h3>
        {prize.detail && (
          <p className="mt-1.5 text-xs text-muted-foreground">{prize.detail}</p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="type-label text-[9px]">Anunciante</span>
          <br />
          <span className="font-medium text-foreground/90">{prize.sponsor}</span>
        </p>

        {action && <div className="mt-4">{action}</div>}
      </div>
    </motion.article>
  )
}

export function EmptyAnnualSlotCard({
  position,
  action,
}: {
  position: 1 | 2 | 3
  action?: React.ReactNode
}) {
  const isFirst = position === 1

  return (
    <motion.article
      {...fadeUp(position)}
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl border border-dashed bg-card/30',
        isFirst ? 'lg:-mt-3' : '',
      )}
    >
      <div className="flex aspect-[16/10] items-center justify-center bg-secondary/20">
        <Gift className="size-8 text-muted-foreground/20" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="type-badge inline-flex w-fit rounded-md bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">
          Puesto #{position}
        </span>
        <p className="mt-3 text-sm text-muted-foreground">
          Sin premio patrocinado todavía.
        </p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </motion.article>
  )
}

export function StreakPrizeCard({
  prize,
  index,
  action,
}: {
  prize: StreakCatalogPrize
  index: number
  action?: React.ReactNode
}) {
  const tierGlow =
    prize.milestone >= 14
      ? 'border-accent/25'
      : prize.milestone >= 8
        ? 'border-primary/20'
        : 'border-border'
  const isPending = prize.status === 'pending'

  return (
    <motion.article
      {...fadeUp(index + 4)}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border bg-card/60 transition-colors hover:border-primary/25',
        isPending ? 'border-accent/25 opacity-95' : tierGlow,
      )}
    >
      <PrizeCover image={prize.image} alt={prize.title} />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="type-badge inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-[9px] text-accent">
            <Flame className="size-3" />
            Racha {formatStreakValue(prize.milestone)}
          </span>
          <div className="flex flex-col items-end gap-1">
            <PrizeStatusBadge status={prize.status} />
            <span className="font-display text-xs font-bold tabular-nums text-muted-foreground">
              {prize.deliveredCount.toLocaleString('es-AR')} entregados
            </span>
          </div>
        </div>

        <h3 className="mt-3 font-display text-sm font-bold leading-tight text-foreground">
          {prize.title}
        </h3>
        {prize.detail && (
          <p className="mt-1.5 text-xs text-muted-foreground">{prize.detail}</p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="type-label text-[9px]">Anunciante</span>
          <br />
          <span className="font-medium text-foreground/90">{prize.sponsor}</span>
        </p>

        {action && <div className="mt-4">{action}</div>}
      </div>
    </motion.article>
  )
}

export function EmptyStreakSlotCard({
  milestone,
  index,
  action,
}: {
  milestone: number
  index: number
  action?: React.ReactNode
}) {
  return (
    <motion.article
      {...fadeUp(index + 4)}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed bg-card/30"
    >
      <div className="flex aspect-[16/10] items-center justify-center bg-secondary/20">
        <Gift className="size-8 text-muted-foreground/20" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="type-badge inline-flex w-fit items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">
          <Flame className="size-3" />
          Racha {formatStreakValue(milestone)}
        </span>
        <p className="mt-3 text-sm text-muted-foreground">
          Sin premio patrocinado todavía.
        </p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </motion.article>
  )
}
