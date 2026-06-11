import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MatchType, Player } from '@/lib/data'
import { teamLabel } from '@/lib/data'
import { playerShortPublicName } from '@/lib/player-names'

function TeamStack({
  players,
  won,
  accentWin,
  compact,
  align = 'start',
  names = 'inline',
}: {
  players: [Player, Player]
  won?: boolean
  accentWin?: boolean
  compact?: boolean
  align?: 'start' | 'end'
  names?: 'inline' | 'stacked'
}) {
  const isEnd = align === 'end'

  return (
    <div
      className={cn(
        'min-w-0 flex-1',
        won && (accentWin ? 'text-accent' : 'text-primary'),
        !won && 'text-foreground',
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
              compact ? 'size-9 sm:size-8' : 'size-10 sm:size-9',
              i === 1 && (isEnd ? '-mr-2.5' : '-ml-2.5'),
              won && (accentWin ? 'ring-accent/35' : 'ring-primary/35'),
            )}
          />
        ))}
      </div>

      {names === 'stacked' ? (
        <div
          className={cn(
            'mt-2 space-y-0.5',
            isEnd && 'flex flex-col items-end',
          )}
        >
          {players.map((p) => (
            <p
              key={p.id}
              className={cn(
                'text-xs font-semibold leading-tight',
                won && (accentWin ? 'text-glow-gold' : 'text-glow-energy'),
              )}
            >
              {playerShortPublicName(p)}
            </p>
          ))}
        </div>
      ) : (
        <p
          className={cn(
            'mt-1.5 font-medium leading-tight',
            compact ? 'text-xs' : 'text-sm',
            won && 'font-semibold',
          )}
        >
          {teamLabel(players)}
        </p>
      )}
    </div>
  )
}

function VsDivider({
  variant = 'default',
}: {
  variant?: 'default' | 'arena' | 'pierdePaga'
}) {
  if (variant === 'arena' || variant === 'pierdePaga') {
    return (
      <div className="flex shrink-0 flex-col items-center gap-1 px-1">
        <span className="font-display text-[10px] font-black tracking-[0.2em] text-muted-foreground/45">
          VS
        </span>
        <div
          className={cn(
            'h-10 w-px bg-gradient-to-b from-transparent to-transparent',
            variant === 'pierdePaga'
              ? 'via-accent/25'
              : 'via-primary/25',
          )}
        />
      </div>
    )
  }

  return (
    <div className="shrink-0 px-1 text-center">
      <span className="text-[10px] font-bold text-muted-foreground">vs</span>
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
        'flex items-center gap-2 border-t border-border/50 px-4 py-2.5',
        className,
      )}
    >
      {type && (
        <span
          className={cn(
            'type-badge rounded-md px-2 py-0.5 text-[9px]',
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
}) {
  const isPierdePaga = type === 'Desafío pierde paga'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-card/50 transition-colors',
        isPierdePaga
          ? 'border-accent/20 hover:border-accent/30'
          : highlight
            ? 'border-accent/35 bg-accent/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
            : 'border-border hover:border-border/80 hover:bg-card/60',
        isPierdePaga && 'bg-accent/[0.03]',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3.5 sm:gap-4 sm:px-4">
        <TeamStack
          players={teamA}
          won={winnerTeam === 'A'}
          accentWin={isPierdePaga && winnerTeam === 'A'}
          compact
          align="start"
          names="stacked"
        />

        <div className="shrink-0 text-center">
          {score ? (
            <p className="font-display text-sm font-bold tabular-nums">{score}</p>
          ) : (
            <VsDivider />
          )}
          {time && (
            <p className="mt-1 whitespace-nowrap text-[10px] text-muted-foreground">
              {time}
            </p>
          )}
        </div>

        <TeamStack
          players={teamB}
          won={winnerTeam === 'B'}
          accentWin={isPierdePaga && winnerTeam === 'B'}
          compact
          align="end"
          names="stacked"
        />
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
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors',
        isPierdePaga
          ? 'border-accent/25 hover:border-accent/40'
          : 'border-border hover:border-primary/20',
      )}
    >
      {isPierdePaga && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
      )}

      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-display text-sm font-bold leading-tight">
            <Clock
              className={cn(
                'size-3.5 shrink-0',
                isPierdePaga ? 'text-accent' : 'text-primary',
              )}
            />
            {scheduledAt}
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{club}</span>
          </p>
        </div>
        {stake && (
          <span className="shrink-0 font-display text-sm font-black tabular-nums text-accent text-glow-gold">
            {stake}
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center gap-2 border-t border-border/50 px-4 py-4">
        <TeamStack
          players={teamA}
          compact
          align="start"
          names="stacked"
        />
        <VsDivider variant={isPierdePaga ? 'pierdePaga' : 'arena'} />
        <TeamStack
          players={teamB}
          compact
          align="end"
          names="stacked"
        />
      </div>

      <div className="border-t border-border/40 px-4 py-2.5">
        <span
          className={cn(
            'type-badge rounded-md px-2 py-0.5 text-[9px]',
            isPierdePaga
              ? 'bg-accent/15 text-accent'
              : 'bg-primary/10 text-primary',
          )}
        >
          {isPierdePaga ? 'Pierde paga' : 'Simple'}
        </span>
      </div>
    </article>
  )
}
