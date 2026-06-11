'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Search,
  Swords,
  TrendingUp,
} from 'lucide-react'
import { leaderboard, RANKING_PAGE_SIZE, type Player } from '@/lib/data'
import { playerProfilePath, routes } from '@/lib/routes'
import { playerMatchesSearch, playerPublicName } from '@/lib/player-names'
import { fadeUp } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/auth/user-provider'
import { useRegion } from '@/components/region-provider'
import { useRanking } from '@/hooks/use-ranking'
import { formatSkill, playerSkill, SKILL_LABEL } from '@/lib/skill'
import { formatStreakValue } from '@/lib/streaks'
import { StreakBadge } from '@/components/arena/streak-badge'

const TABLE_GRID =
  'grid w-max min-w-full grid-cols-[11.75rem_2.5rem_4rem_2.25rem_2.25rem_2.5rem] sm:w-full sm:min-w-0 sm:grid-cols-[3.25rem_minmax(12rem,1fr)_3rem_4.75rem_3.25rem_3.25rem_3.25rem]'

const inputClass =
  'w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/25'

type SortColumn = 'rank' | 'streak' | 'skill' | 'matches' | 'wins' | 'losses'
type SortDirection = 'asc' | 'desc'

type SortState = {
  column: SortColumn
  direction: SortDirection
}

const DEFAULT_DIRECTION: Record<SortColumn, SortDirection> = {
  rank: 'asc',
  streak: 'desc',
  skill: 'desc',
  matches: 'desc',
  wins: 'desc',
  losses: 'desc',
}

function matchesPlayed(player: Player) {
  return player.wins + player.losses
}

function sortPlayers(
  players: Player[],
  column: SortColumn,
  direction: SortDirection,
): Player[] {
  const factor = direction === 'asc' ? 1 : -1

  return [...players].sort((a, b) => {
    let diff = 0

    switch (column) {
      case 'rank':
        diff = a.rank - b.rank
        break
      case 'streak':
        diff = a.streak - b.streak
        break
      case 'skill':
        diff = playerSkill(a) - playerSkill(b)
        break
      case 'matches':
        diff = matchesPlayed(a) - matchesPlayed(b)
        break
      case 'wins':
        diff = a.wins - b.wins
        break
      case 'losses':
        diff = a.losses - b.losses
        break
    }

    if (diff !== 0) return diff * factor
    return a.rank - b.rank
  })
}

function rowSurfaceClass(isEven: boolean, isMe: boolean) {
  if (isMe) {
    return 'bg-gradient-to-r from-primary/16 via-primary/7 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
  }
  if (isEven) return 'bg-white/[0.02] hover:bg-white/[0.035]'
  return 'hover:bg-white/[0.025]'
}

function RankNumber({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        'font-display text-sm font-extrabold tabular-nums sm:text-base',
        rank === 1 && 'text-accent text-glow-gold',
        rank === 2 && 'text-foreground/90',
        rank === 3 && 'text-orange-400/90',
        rank > 3 && 'text-muted-foreground',
      )}
    >
      {rank}
    </span>
  )
}

function RankDeltaIcon({ delta }: { delta: number }) {
  const title =
    delta > 0
      ? `Subió ${delta} ${delta === 1 ? 'puesto' : 'puestos'}`
      : delta < 0
        ? `Bajó ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'puesto' : 'puestos'}`
        : 'Se mantiene'

  if (delta > 0) {
    return (
      <TrendingUp
        className="size-3 shrink-0 text-primary"
        aria-label={title}
        title={title}
      />
    )
  }

  if (delta < 0) {
    return (
      <TrendingUp
        className="size-3 shrink-0 rotate-180 text-destructive"
        aria-label={title}
        title={title}
      />
    )
  }

  return (
    <Minus
      className="size-3 shrink-0 text-muted-foreground/60"
      aria-label={title}
      title={title}
    />
  )
}

function SortableHeader({
  label,
  column,
  align = 'left',
  sort,
  onSort,
  className,
}: {
  label: string
  column: SortColumn
  align?: 'left' | 'center' | 'right'
  sort: SortState
  onSort: (column: SortColumn) => void
  className?: string
}) {
  const isActive = sort.column === column

  return (
    <div
      className={cn(
        'flex items-center',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'type-label inline-flex h-7 items-center gap-0.5 rounded-md px-2 leading-none transition-colors hover:text-foreground',
          isActive && 'bg-primary/10 text-foreground',
        )}
        aria-sort={
          isActive
            ? sort.direction === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
        }
      >
        <span className="leading-none">{label}</span>
        {isActive &&
          (sort.direction === 'asc' ? (
            <ChevronUp className="size-3 shrink-0 text-primary" />
          ) : (
            <ChevronDown className="size-3 shrink-0 text-primary" />
          ))}
      </button>
    </div>
  )
}

function PlayerIdentity({
  player,
  isMe,
}: {
  player: Player
  isMe: boolean
}) {
  const isElite = player.rank <= 3

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={player.avatar || '/placeholder.svg'}
        alt=""
        className={cn(
          'size-9 shrink-0 rounded-lg object-cover ring-1 ring-border sm:size-10',
          isMe && 'ring-2 ring-primary/45',
          !isMe && isElite && 'ring-1 ring-accent/35',
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              'truncate text-sm font-semibold',
              isMe && 'text-primary',
            )}
          >
            {playerPublicName(player)}
          </span>
          <StreakBadge streak={player.streak} />
          {isMe && (
            <span className="type-badge shrink-0 rounded-md bg-primary px-1.5 py-0.5 text-[8px] text-primary-foreground shadow-[0_0_10px_oklch(0.78_0.14_195/0.35)]">
              Vos
            </span>
          )}
        </p>
      </div>
    </>
  )
}

function RankingRow({
  player,
  isMe,
  rowIndex,
  onViewPlayer,
}: {
  player: Player
  isMe: boolean
  rowIndex: number
  onViewPlayer: (playerId: string) => void
}) {
  const total = matchesPlayed(player)
  const isEven = rowIndex % 2 === 0
  const surface = rowSurfaceClass(isEven, isMe)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onViewPlayer(player.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onViewPlayer(player.id)
        }
      }}
      className={cn(
        'group relative cursor-pointer items-center gap-x-2 border-b border-border/40 px-3 transition-[background,box-shadow] duration-200 hover:brightness-110 sm:gap-x-3 sm:px-5',
        TABLE_GRID,
        surface,
        isMe && 'ring-1 ring-inset ring-primary/15',
      )}
    >
      {/* Mobile: identidad sticky */}
      <div
        className={cn(
          'sticky left-0 z-[1] -ml-3 flex min-w-[11.75rem] items-center gap-1.5 border-r border-border/30 py-3 pr-4 pl-3 sm:hidden',
          surface,
        )}
      >
        <div className="flex w-[1.85rem] shrink-0 items-center justify-center gap-0.5">
          <RankNumber rank={player.rank} />
          <RankDeltaIcon delta={player.rankDelta} />
        </div>
        <PlayerIdentity player={player} isMe={isMe} />
      </div>

      {/* Desktop: # */}
      <div className="hidden items-center justify-center gap-0.5 py-3.5 sm:flex">
        <RankNumber rank={player.rank} />
        <RankDeltaIcon delta={player.rankDelta} />
      </div>

      {/* Desktop: jugador */}
      <div className="hidden min-w-0 items-center gap-2.5 py-3.5 sm:flex">
        <PlayerIdentity player={player} isMe={isMe} />
      </div>

      <span
        className={cn(
          'flex items-center justify-center py-3 font-display text-sm font-bold tabular-nums sm:py-3.5',
          player.streak > 0 && 'text-accent',
          player.streak < 0 && 'text-destructive',
          player.streak === 0 && 'text-muted-foreground/70',
        )}
      >
        {formatStreakValue(player.streak)}
      </span>

      <span className="flex items-center justify-end py-3 font-display text-sm font-extrabold tabular-nums text-foreground text-glow-energy sm:py-3.5 sm:text-base">
        {formatSkill(playerSkill(player))}
      </span>

      <span className="flex items-center justify-center py-3 text-sm tabular-nums text-muted-foreground/80 sm:py-3.5">
        {total}
      </span>

      <span className="flex items-center justify-center py-3 text-sm font-medium tabular-nums text-primary sm:py-3.5">
        {player.wins}
      </span>

      <span className="flex items-center justify-center py-3 pr-2 text-sm font-medium tabular-nums text-destructive/90 sm:py-3.5 sm:pr-0">
        {player.losses}
      </span>
    </div>
  )
}

export function RankingView() {
  const router = useRouter()
  const { player } = useUser()
  const { rankingTitle } = useRegion()
  const { leaderboard, loading, error } = useRanking()
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState>({
    column: 'rank',
    direction: 'asc',
  })

  function handleViewPlayer(playerId: string) {
    router.push(playerProfilePath(playerId))
  }

  function handleSort(column: SortColumn) {
    setSort((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { column, direction: DEFAULT_DIRECTION[column] }
    })
  }

  useEffect(() => {
    setPage(0)
  }, [query, sort])

  const sorted = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = normalized
      ? leaderboard.filter((p) => playerMatchesSearch(p, normalized))
      : leaderboard

    return sortPlayers(filtered, sort.column, sort.direction)
  }, [query, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / RANKING_PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pagePlayers = sorted.slice(
    safePage * RANKING_PAGE_SIZE,
    (safePage + 1) * RANKING_PAGE_SIZE,
  )

  return (
    <div className="space-y-8 pb-10">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
          {rankingTitle}
        </h1>
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </motion.div>

      <motion.section {...fadeUp(1)}>
        {loading ? (
          <div className="rounded-2xl border border-border bg-card/50 px-5 py-12 text-center text-sm text-muted-foreground">
            Cargando ranking…
          </div>
        ) : (
          <>
        <div className="relative mb-4 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jugador..."
            className={cn(inputClass, 'pl-9')}
          />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          <div className="relative overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <div className="pointer-events-none absolute top-0 right-0 z-[5] h-full w-6 bg-gradient-to-l from-card/80 to-transparent sm:hidden" />

            <div className="min-w-full">
              <div
                className={cn(
                  'glass sticky top-0 z-10 items-center gap-x-2 border-b border-primary/10 px-3 py-2.5 sm:gap-x-3 sm:px-5 sm:py-3',
                  TABLE_GRID,
                )}
              >
                <div className="sticky left-0 z-20 -ml-3 flex min-w-[11.75rem] items-center gap-2 border-r border-border/30 bg-card/90 py-2.5 pr-4 pl-3 sm:hidden">
                  <SortableHeader
                    label="#"
                    column="rank"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <span className="type-label min-w-0 flex-1 truncate">
                    Jugador
                  </span>
                </div>
                <SortableHeader
                  label="#"
                  column="rank"
                  sort={sort}
                  onSort={handleSort}
                  className="hidden sm:flex"
                />
                <span className="type-label hidden min-w-0 leading-none sm:flex sm:items-center">
                  Jugador
                </span>
                <SortableHeader
                  label="Racha"
                  column="streak"
                  align="center"
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label={SKILL_LABEL}
                  column="skill"
                  align="right"
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="PJ"
                  column="matches"
                  align="center"
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="G"
                  column="wins"
                  align="center"
                  sort={sort}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="P"
                  column="losses"
                  align="center"
                  sort={sort}
                  onSort={handleSort}
                />
              </div>

              {pagePlayers.length > 0 ? (
                pagePlayers.map((p, i) => {
                  const isMe = p.id === player.id
                  return (
                    <RankingRow
                      key={p.id}
                      player={p}
                      isMe={isMe}
                      rowIndex={i}
                      onViewPlayer={handleViewPlayer}
                    />
                  )
                })
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {leaderboard.length === 0
                      ? 'Todavía no hay partidos en este ranking'
                      : 'No encontramos jugadores'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {leaderboard.length === 0
                      ? 'Cargá un partido en Desafíos para empezar a sumar posiciones.'
                      : 'Probá con otro nombre o usuario'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {sorted.length > RANKING_PAGE_SIZE && (
            <div className="flex items-center justify-between gap-4 border-t border-border/60 bg-card/40 px-4 py-3 sm:px-5">
              <button
                type="button"
                disabled={safePage === 0}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors enabled:hover:border-primary/40 enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                Anterior
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    className={cn(
                      'grid size-8 place-items-center rounded-lg font-display text-xs font-bold tabular-nums transition-colors',
                      safePage === i
                        ? 'bg-primary text-primary-foreground shadow-[0_0_12px_oklch(0.78_0.14_195/0.35)]'
                        : 'border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors enabled:hover:border-primary/40 enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <Link href={routes.challenges}>
            <motion.span
              {...fadeUp(2)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-5 py-3 font-display text-sm font-bold text-primary transition-colors hover:bg-primary/20"
            >
              <Swords className="size-4" /> Desafiar a un rival
            </motion.span>
          </Link>
        </div>
          </>
        )}
      </motion.section>
    </div>
  )
}
