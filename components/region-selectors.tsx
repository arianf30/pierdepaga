'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  COUNTRIES,
  provincesFor,
  type CountryId,
} from '@/lib/regions'
import { cn } from '@/lib/utils'

const valueClass =
  'font-display text-xs font-semibold uppercase tracking-[0.14em] text-foreground'

const shellClass =
  'group relative h-11 rounded-xl border border-border/80 bg-secondary/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,box-shadow] hover:border-primary/35 hover:bg-secondary/70 has-[:focus-visible]:border-primary/50 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-primary/25'

function SelectShell({
  label,
  className,
  children,
  value,
  onChange,
  options,
  flagOnly = false,
}: {
  label: string
  className?: string
  children: ReactNode
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  flagOnly?: boolean
}) {
  return (
    <div className={cn(shellClass, className)}>
      <div
        className={cn(
          'flex h-full items-center',
          flagOnly ? 'justify-center px-0' : 'gap-2.5 pl-3.5 pr-10',
        )}
      >
        {children}
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 z-10 cursor-pointer appearance-none opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {!flagOnly && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center border-l border-border/50 bg-black/10"
          aria-hidden
        >
          <ChevronDown className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
        </div>
      )}
    </div>
  )
}

export function RegionSelectors({ className }: { className?: string }) {
  const [country, setCountry] = useState<CountryId>('ar')
  const [province, setProvince] = useState(provincesFor('ar')[0])

  function handleCountryChange(next: CountryId) {
    setCountry(next)
    setProvince(provincesFor(next)[0])
  }

  const selectedCountry = COUNTRIES.find((c) => c.id === country)!

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <SelectShell
        label="País"
        flagOnly
        className="size-11 shrink-0"
        value={country}
        onChange={(v) => handleCountryChange(v as CountryId)}
        options={COUNTRIES.map((c) => ({
          value: c.id,
          label: `${c.flag} ${c.name}`,
        }))}
      >
        <span className="text-[1.625rem] leading-none">
          {selectedCountry.flag}
        </span>
      </SelectShell>

      <SelectShell
        label="Provincia o ciudad"
        className="min-w-[9.5rem]"
        value={province}
        onChange={setProvince}
        options={provincesFor(country).map((p) => ({
          value: p,
          label: p.toUpperCase(),
        }))}
      >
        <span className={cn(valueClass, 'min-w-0 truncate')}>
          {province.toUpperCase()}
        </span>
      </SelectShell>
    </div>
  )
}
