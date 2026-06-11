'use client'

import { useEffect, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { Search, X } from 'lucide-react'
import { PLAYER_SEARCH_LIMIT, type Player } from '@/lib/data'
import { mapProfileSearchToPlayer } from '@/lib/ranking/map-player'
import { playerFullName, playerPublicName } from '@/lib/player-names'
import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'
import { cn } from '@/lib/utils'

const labelClass = 'type-label mb-1.5 block text-[11px]'

const fieldBoxClass =
  'flex h-11 min-w-0 items-center rounded-xl border border-border bg-secondary/40'

const inputClass =
  'h-full w-full min-w-0 border-0 bg-transparent py-0 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0'

function PlayerOption({ player }: { player: Player }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={player.avatar || '/placeholder.svg'}
        alt=""
        className="size-8 shrink-0 rounded-lg object-cover ring-1 ring-border"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {playerPublicName(player)}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {playerFullName(player) !== playerPublicName(player)
            ? `${playerFullName(player)} · ${player.handle}`
            : player.handle}
        </p>
      </div>
      <span className="shrink-0 font-display text-xs font-bold tabular-nums text-muted-foreground">
        #{player.rank}
      </span>
    </div>
  )
}

function SelectedPlayerField({
  label,
  player,
  onClear,
}: {
  label: string
  player: Player
  onClear: () => void
}) {
  return (
    <div className="min-w-0">
      <p className={labelClass}>{label}</p>
      <div className={cn(fieldBoxClass, 'gap-2 px-2.5')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={player.avatar || '/placeholder.svg'}
          alt=""
          className="size-7 shrink-0 rounded-lg object-cover ring-1 ring-border"
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {playerPublicName(player)}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Quitar a ${playerPublicName(player)}`}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export function PlayerSearchField({
  id,
  label,
  value,
  onChange,
  excludeIds = [],
  placeholder = 'Buscar jugador...',
  tone = 'primary',
}: {
  id: string
  label: string
  value: Player | null
  onChange: (player: Player | null) => void
  excludeIds?: string[]
  placeholder?: string
  tone?: 'primary' | 'accent'
}) {
  const isAccent = tone === 'accent'
  const { country, province } = useRegion()
  const { sport } = useSport()
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<Player[]>([])
  const [searching, setSearching] = useState(false)

  const hasQuery = inputValue.trim().length > 0

  useEffect(() => {
    if (!hasQuery) {
      setResults([])
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setSearching(true)
      try {
        const params = new URLSearchParams({
          country,
          province,
          sport,
          q: inputValue.trim(),
        })
        excludeIds.forEach((id) => params.append('exclude', id))

        const response = await fetch(`/api/players/search?${params}`, {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        })
        const body = (await response.json()) as {
          players?: Array<{
            id: string
            first_name: string
            last_name: string
            display_name: string
            avatar_url: string | null
            ranking: {
              rank_position: number | null
              skill_rating: number
              wins: number
              losses: number
              streak: number
              rank_delta: number
            } | null
          }>
        }

        if (!response.ok) {
          setResults([])
          return
        }

        setResults(
          (body.players ?? []).map((row) =>
            mapProfileSearchToPlayer(
              {
                ...row,
                ranking: row.ranking,
              },
              province,
            ),
          ),
        )
      } catch {
        if (!controller.signal.aborted) setResults([])
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [country, province, sport, inputValue, excludeIds, hasQuery])

  useEffect(() => {
    setInputValue('')
    setOpen(false)
  }, [value?.id])

  function handleClear() {
    setInputValue('')
    setOpen(false)
    onChange(null)
  }

  if (value) {
    return (
      <SelectedPlayerField
        label={label}
        player={value}
        onClear={handleClear}
      />
    )
  }

  return (
    <div className="min-w-0">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>

      <Combobox.Root
        key="player-search"
        items={results}
        filteredItems={results}
        limit={PLAYER_SEARCH_LIMIT}
        autoHighlight
        open={hasQuery && open}
        onOpenChange={setOpen}
        openOnInputClick={false}
        inputValue={inputValue}
        onInputValueChange={(next) => {
          setInputValue(next)
          setOpen(next.trim().length > 0)
        }}
        itemToStringLabel={(player) =>
          `${playerPublicName(player)} ${playerFullName(player)} ${player.handle}`
        }
        isItemEqualToValue={(a, b) => a.id === b.id}
        onValueChange={(player) => {
          if (player) {
            onChange(player)
            setInputValue('')
            setOpen(false)
          }
        }}
      >
        <Combobox.InputGroup className={cn(fieldBoxClass, 'relative')}>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Combobox.Input
            id={id}
            placeholder={placeholder}
            autoComplete="off"
            className={inputClass}
          />
        </Combobox.InputGroup>

        <Combobox.Portal>
          <Combobox.Positioner
            className="z-60 outline-none"
            side="bottom"
            align="start"
            sideOffset={6}
          >
            <Combobox.Popup className="w-(--anchor-width) rounded-xl border border-border bg-popover shadow-xl">
              <Combobox.Empty className="p-0">
                <span className="block px-3 py-3 text-center text-xs text-muted-foreground">
                  {searching
                    ? 'Buscando jugadores…'
                    : 'No encontramos ese jugador'}
                </span>
              </Combobox.Empty>

              <Combobox.List
                className={cn(
                  'max-h-60 overflow-y-auto overscroll-contain py-1 outline-none',
                  '[&::-webkit-scrollbar]:w-1.5',
                  '[&::-webkit-scrollbar-track]:bg-transparent',
                  '[&::-webkit-scrollbar-thumb]:rounded-full',
                  '[&::-webkit-scrollbar-thumb]:bg-border',
                )}
              >
                {(player: Player) => (
                  <Combobox.Item
                    key={player.id}
                    value={player}
                    className={cn(
                      'mx-1 cursor-pointer rounded-lg px-2.5 py-2 outline-none transition-colors',
                      isAccent
                        ? 'data-highlighted:bg-accent/10 data-selected:bg-accent/15'
                        : 'data-highlighted:bg-primary/10 data-selected:bg-primary/15',
                      'data-highlighted:text-foreground',
                    )}
                  >
                    <PlayerOption player={player} />
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  )
}
