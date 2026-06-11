'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_COUNTRY_ID,
  availableProvincesFor,
  defaultProvinceFor,
  rankingLabel,
  type CountryId,
} from '@/lib/catalog'

type RegionContextValue = {
  country: CountryId
  province: string
  setCountry: (country: CountryId) => void
  setProvince: (province: string) => void
  rankingTitle: string
  rankingKicker: string
}

const RegionContext = createContext<RegionContextValue | null>(null)

export function RegionProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryId>(DEFAULT_COUNTRY_ID)
  const [province, setProvince] = useState(
    defaultProvinceFor(DEFAULT_COUNTRY_ID),
  )

  function setCountry(next: CountryId) {
    setCountryState(next)
    setProvince(defaultProvinceFor(next))
  }

  function setProvinceSafe(next: string) {
    const provinces = availableProvincesFor(country)
    if (!provinces.includes(next)) return
    setProvince(next)
  }

  const rankingTitle = rankingLabel(province)
  const rankingKicker = rankingTitle

  return (
    <RegionContext.Provider
      value={{
        country,
        province,
        setCountry,
        setProvince: setProvinceSafe,
        rankingTitle,
        rankingKicker,
      }}
    >
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  const ctx = useContext(RegionContext)
  if (!ctx) throw new Error('useRegion debe usarse dentro de RegionProvider')
  return ctx
}
