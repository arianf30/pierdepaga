'use client'

import { useRegion } from '@/components/region-provider'
import { useSport } from '@/components/sport-provider'
import { SelectShell, selectValueClass } from '@/components/ui/select-shell'
import {
  AVAILABLE_COUNTRIES,
  AVAILABLE_SPORTS,
  availableCountryById,
  availableProvincesFor,
  sportLabel,
  type CountryId,
  type SportId,
} from '@/lib/catalog'
import { cn } from '@/lib/utils'

export function RegionSelectors({ className }: { className?: string }) {
  const { country, province, setCountry, setProvince } = useRegion()
  const { sport, setSport } = useSport()
  const selectedCountry = availableCountryById(country)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <SelectShell
        label="País"
        flagOnly
        className="size-11 shrink-0"
        value={country}
        onChange={(v) => setCountry(v as CountryId)}
        options={AVAILABLE_COUNTRIES.map((item) => ({
          value: item.id,
          label: `${item.flag} ${item.name}`,
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
        options={availableProvincesFor(country).map((item) => ({
          value: item,
          label: item.toUpperCase(),
        }))}
      >
        <span className={cn(selectValueClass, 'min-w-0 truncate')}>
          {province.toUpperCase()}
        </span>
      </SelectShell>

      <SelectShell
        label="Deporte"
        className="min-w-[6.5rem]"
        value={sport}
        onChange={(v) => setSport(v as SportId)}
        options={AVAILABLE_SPORTS.map((item) => ({
          value: item.id,
          label: item.label.toUpperCase(),
        }))}
      >
        <span className={cn(selectValueClass, 'min-w-0 truncate')}>
          {sportLabel(sport).toUpperCase()}
        </span>
      </SelectShell>
    </div>
  )
}
