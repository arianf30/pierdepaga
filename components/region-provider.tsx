'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  provincesFor,
  rankingLabel,
  type CountryId,
} from '@/lib/regions'

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
  const [country, setCountryState] = useState<CountryId>('ar')
  const [province, setProvince] = useState(provincesFor('ar')[0])

  function setCountry(next: CountryId) {
    setCountryState(next)
    setProvince(provincesFor(next)[0])
  }

  const rankingTitle = rankingLabel(province)
  const rankingKicker = rankingTitle

  return (
    <RegionContext.Provider
      value={{
        country,
        province,
        setCountry,
        setProvince,
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
