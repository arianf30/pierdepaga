'use client'

import { useEffect, useMemo, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { Building2, Plus, Search, X } from 'lucide-react'
import {
  CLUB_SEARCH_LIMIT,
  searchClubs,
  type Club,
} from '@/lib/data'
import { useRegion } from '@/components/region-provider'
import { cn } from '@/lib/utils'

const labelClass = 'type-label mb-1.5 block text-[11px]'

const fieldBoxClass =
  'flex h-11 min-w-0 items-center rounded-xl border border-border bg-secondary/40'

const inputClass =
  'h-full w-full min-w-0 border-0 bg-transparent py-0 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0'

export type ClubSelection = {
  id: string
  name: string
  province: string
  country_id: string
  isCustom?: boolean
}

type ClubListItem =
  | (Club & { isCustom?: false })
  | { id: '__custom__'; name: string; isCustom: true }

function ClubOption({ club }: { club: ClubListItem }) {
  if (club.isCustom) {
    return (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-dashed border-primary/40 bg-primary/10 text-primary">
          <Plus className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Agregar club</p>
          <p className="truncate text-[11px] text-muted-foreground">
            Usar «{club.name}»
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground">
        <Building2 className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{club.name}</p>
        {club.city && (
          <p className="truncate text-[11px] text-muted-foreground">
            {club.city}
          </p>
        )}
      </div>
    </div>
  )
}

function SelectedClubField({
  label,
  club,
  onClear,
}: {
  label: string
  club: ClubSelection
  onClear: () => void
}) {
  return (
    <div className="min-w-0">
      <p className={labelClass}>{label}</p>
      <div className={cn(fieldBoxClass, 'gap-2 px-2.5')}>
        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground">
          <Building2 className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {club.name}
          </span>
          {club.isCustom && (
            <span className="text-[10px] text-muted-foreground">
              Club nuevo
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Quitar ${club.name}`}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

function toSelection(
  item: ClubListItem,
  countryId: string,
  fallbackProvince: string,
): ClubSelection {
  if (item.isCustom) {
    return {
      id: `custom:${item.name}`,
      name: item.name,
      province: fallbackProvince,
      country_id: countryId,
      isCustom: true,
    }
  }
  return {
    id: item.id,
    name: item.name,
    province: item.city ?? fallbackProvince,
    country_id: countryId,
  }
}

export function ClubSearchField({
  id,
  label,
  value,
  onChange,
  placeholder = 'Buscar club...',
}: {
  id: string
  label: string
  value: ClubSelection | null
  onChange: (club: ClubSelection | null) => void
  placeholder?: string
}) {
  const { country, province } = useRegion()
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)

  const hasQuery = inputValue.trim().length > 0

  const results = useMemo((): ClubListItem[] => {
    if (!hasQuery) return []

    const trimmed = inputValue.trim()
    const matches = searchClubs(trimmed, { limit: CLUB_SEARCH_LIMIT })
    const hasExact = matches.some(
      (club) => club.name.toLowerCase() === trimmed.toLowerCase(),
    )

    if (!hasExact) {
      return [...matches, { id: '__custom__', name: trimmed, isCustom: true }]
    }

    return matches
  }, [inputValue, hasQuery])

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
      <SelectedClubField
        label={label}
        club={value}
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
        key="club-search"
        items={results}
        filteredItems={results}
        limit={CLUB_SEARCH_LIMIT + 1}
        autoHighlight
        open={hasQuery && open}
        onOpenChange={setOpen}
        openOnInputClick={false}
        inputValue={inputValue}
        onInputValueChange={(next) => {
          setInputValue(next)
          setOpen(next.trim().length > 0)
        }}
        itemToStringLabel={(item: ClubListItem) => item.name}
        isItemEqualToValue={(a: ClubListItem, b: ClubListItem) => a.id === b.id}
        onValueChange={(item: ClubListItem | null) => {
          if (item) {
            onChange(toSelection(item, country, province))
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
                  Escribí para buscar o agregar un club
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
                {(club: ClubListItem) => (
                  <Combobox.Item
                    key={club.id === '__custom__' ? `custom-${club.name}` : club.id}
                    value={club}
                    className={cn(
                      'mx-1 cursor-pointer rounded-lg px-2.5 py-2 outline-none transition-colors',
                      'data-highlighted:bg-primary/10 data-highlighted:text-foreground',
                      'data-selected:bg-primary/15',
                    )}
                  >
                    <ClubOption club={club} />
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
