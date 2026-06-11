'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_SPORT_ID, sportLabel, type SportId } from '@/lib/catalog'

type SportContextValue = {
  sport: SportId
  setSport: (sport: SportId) => void
  sportName: string
}

const SportContext = createContext<SportContextValue | null>(null)

export function SportProvider({ children }: { children: ReactNode }) {
  const [sport, setSport] = useState<SportId>(DEFAULT_SPORT_ID)

  return (
    <SportContext.Provider
      value={{
        sport,
        setSport,
        sportName: sportLabel(sport),
      }}
    >
      {children}
    </SportContext.Provider>
  )
}

export function useSport() {
  const ctx = useContext(SportContext)
  if (!ctx) throw new Error('useSport debe usarse dentro de SportProvider')
  return ctx
}
