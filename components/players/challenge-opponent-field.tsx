'use client'

import { useEffect, useMemo, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { Search, X } from 'lucide-react'
import {
  CHALLENGE_SKILL_RANGE,
  PLAYER_SEARCH_LIMIT,
  searchChallengeOpponents,
  type Player,
} from '@/lib/data'
import { playerFullName, playerPublicName } from '@/lib/player-names'
import { formatSkill } from '@/lib/skill'
import { cn } from '@/lib/utils'

const labelClass = 'type-label mb-1.5 block text-[11px]'

const fieldBoxClass =
  'flex h-11 min-w-0 items-center rounded-xl border border-border bg-secondary/40'

const inputClass =
  'h-full w-full min-w-0 border-0 bg-transparent py-0 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0'

function OpponentOption({ player }: { player: Player }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={player.avatar || '/placeholder.svg'}
        alt=""
        className="size-8 shrink-0 rounded-lg object-cover ring-1 ring-border"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-none">
        <p className="truncate text-sm font-semibold leading-none">
          {playerPublicName(player)}
        </p>
        <p className="truncate text-[11px] leading-none text-muted-foreground">
          {formatSkill(player.rating)} hab.
        </p>
      </div>
      <span className="shrink-0 font-display text-xs font-bold tabular-nums text-muted-foreground">
        #{player.rank}
      </span>
    </div>
  )
}

function SelectedOpponentField({
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
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 leading-none">
          <span className="truncate text-sm font-semibold leading-none">
            {playerPublicName(player)}
          </span>
          <span className="truncate text-[10px] leading-none text-muted-foreground">
            {formatSkill(player.rating)} hab.
          </span>
        </div>
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

export function ChallengeOpponentField({
  id,
  label,
  value,
  onChange,
  teamAverage,
  excludeIds = [],
  disabled,
}: {
  id: string
  label: string
  value: Player | null
  onChange: (player: Player | null) => void
  teamAverage: number | null
  excludeIds?: string[]
  disabled?: boolean
}) {
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  const hasQuery = inputValue.trim().length > 0

  const results = useMemo(() => {
    if (!hasQuery || teamAverage === null) return []
    return searchChallengeOpponents(inputValue, teamAverage, {
      excludeIds,
      limit: PLAYER_SEARCH_LIMIT,
    })
  }, [inputValue, hasQuery, teamAverage, excludeIds])

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
      <SelectedOpponentField
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

      {teamAverage === null ? (
        <div className="flex h-11 items-center rounded-xl border border-dashed border-border bg-secondary/20 px-3 text-xs text-muted-foreground">
          Elegí tu compañero primero
        </div>
      ) : (
        <>
          <Combobox.Root
            key="opponent-search"
            items={results}
            filteredItems={results}
            limit={PLAYER_SEARCH_LIMIT}
            autoHighlight
            open={hasQuery && open && !disabled}
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
            <Combobox.InputGroup
              className={cn(fieldBoxClass, 'relative', disabled && 'opacity-40')}
            >
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Combobox.Input
                id={id}
                disabled={disabled}
                placeholder="Buscar rival..."
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
                      No hay rivales en ±{CHALLENGE_SKILL_RANGE} pts de tu promedio
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
                          'data-highlighted:bg-accent/10 data-highlighted:text-foreground',
                          'data-selected:bg-accent/15',
                        )}
                      >
                        <OpponentOption player={player} />
                      </Combobox.Item>
                    )}
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>

          <p className="mt-1.5 text-[10px] text-muted-foreground">
            ±{CHALLENGE_SKILL_RANGE} pts del promedio ({formatSkill(teamAverage)})
          </p>
        </>
      )}
    </div>
  )
}
