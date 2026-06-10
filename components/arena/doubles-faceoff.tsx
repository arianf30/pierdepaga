import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MatchType, Player } from '@/lib/data'
import { teamLabel } from '@/lib/data'

function TeamStack({
  players,
  won,
  compact,
  align = 'start',
}: {
  players: [Player, Player]
  won?: boolean
  compact?: boolean
  align?: 'start' | 'end'
}) {
  const isEnd = align === 'end'

  return (
    <div
      className={cn(
        'min-w-0 max-w-[42%] sm:max-w-none',
        won ? 'text-primary' : 'text-foreground',
        isEnd && 'text-right',
      )}
    >
      <div
        className={cn(
          'inline-flex items-center',
          isEnd && 'flex-row-reverse',
        )}
      >
        {players.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.id}
            src={p.avatar || '/placeholder.svg'}
            alt=""
            className={cn(
              'rounded-lg object-cover ring-2 ring-card',
              compact ? 'size-8 sm:size-7' : 'size-9 sm:size-8',
              i === 1 && (isEnd ? '-mr-2.5' : '-ml-2.5'),
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          'mt-1.5 line-clamp-2 font-medium leading-tight',
          compact ? 'text-[11px] sm:text-[10px]' : 'text-xs',
          won && 'font-semibold',
        )}
      >
        {teamLabel(players)}
      </p>
    </div>
  )
}

function MatchMeta({
  type,
  stake,
  className,
}: {
  type?: string
  stake?: string
  className?: string
}) {
  if (!type && !stake) return null
  const isPierdePaga = type === 'Desafío pierde paga'

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-t border-border px-3 py-2 sm:px-4',
        className,
      )}
    >
      {type && (
        <span
          className={cn(
            'type-badge rounded px-1.5 py-0.5 text-[9px]',
            isPierdePaga
              ? 'bg-accent/15 text-accent'
              : 'bg-primary/10 text-primary',
          )}
        >
          {isPierdePaga ? 'Pierde paga' : 'Simple'}
        </span>
      )}
      {stake && (
        <span className="text-xs font-bold text-accent">{stake}</span>
      )}
    </div>
  )
}

export function DoublesFaceoff({
  teamA,
  teamB,
  winnerTeam,
  score,
  time,
  type,
  stake,
  highlight,
}: {
  teamA: [Player, Player]
  teamB: [Player, Player]
  winnerTeam?: 'A' | 'B'
  score?: string
  time?: string
  type?: string
  stake?: string
  highlight?: boolean
  layout?: 'row' | 'stacked'
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-card/50',
        highlight ? 'border-accent/35 bg-accent/5' : 'border-border',
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 px-3 py-3.5 sm:gap-3 sm:px-4">
        <div className="justify-self-start">
          <TeamStack
            players={teamA}
            won={winnerTeam === 'A'}
            compact
            align="start"
          />
        </div>

        <div className="shrink-0 px-1 text-center">
          {score ? (
            <p className="font-display text-xs font-bold tabular-nums sm:text-sm">
              {score}
            </p>
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground">
              vs
            </span>
          )}
          {time && (
            <p className="mt-0.5 whitespace-nowrap text-[9px] text-muted-foreground sm:text-[10px]">
              {time}
            </p>
          )}
        </div>

        <div className="justify-self-end">
          <TeamStack
            players={teamB}
            won={winnerTeam === 'B'}
            compact
            align="end"
          />
        </div>
      </div>

      <MatchMeta type={type} stake={stake} />
    </div>
  )
}

export function UpcomingDoublesCard({
  teamA,
  teamB,
  scheduledAt,
  club,
  type,
  stake,
}: {
  teamA: [Player, Player]
  teamB: [Player, Player]
  scheduledAt: string
  club: string
  type: MatchType
  stake?: string
}) {
  const isPierdePaga = type === 'Desafío pierde paga'

  return (
    <article
      className={cn(
        'flex h-full min-h-[11.5rem] flex-col rounded-2xl border bg-card/70 p-4',
        isPierdePaga ? 'border-accent/30' : 'border-border',
      )}
    >
      <div className="grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1">
        <p className="col-start-1 flex items-center gap-1.5 font-display text-sm font-bold leading-tight">
          <Clock className="size-3.5 shrink-0 text-primary" />
          {scheduledAt}
        </p>
        <p className="col-start-2 row-span-2 self-start pt-0.5 text-right">
          {stake ? (
            <span className="font-display text-sm font-black tabular-nums text-accent">
              {stake}
            </span>
          ) : (
            <span className="inline-block w-14" aria-hidden />
          )}
        </p>
        <p className="col-start-1 flex items-center gap-1 text-xs leading-tight text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{club}</span>
        </p>
      </div>

      <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-end gap-1 border-t border-border pt-4">
        <div className="justify-self-start">
          <TeamStack players={teamA} compact align="start" />
        </div>
        <span className="mb-5 text-[10px] font-bold text-muted-foreground">
          vs
        </span>
        <div className="justify-self-end">
          <TeamStack players={teamB} compact align="end" />
        </div>
      </div>

      <span
        className={cn(
          'type-badge mt-3 w-fit rounded px-1.5 py-0.5 text-[9px]',
          isPierdePaga
            ? 'bg-accent/15 text-accent'
            : 'bg-primary/10 text-primary',
        )}
      >
        {isPierdePaga ? 'Pierde paga' : 'Simple'}
      </span>
    </article>
  )
}
