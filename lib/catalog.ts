/** Catálogo de países, provincias y deportes habilitados en la app. */

export const AVAILABLE_COUNTRIES = [
  { id: 'ar', name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  { id: 'py', name: 'Paraguay', code: 'PRY', flag: '🇵🇾' },
] as const

export type CountryId = (typeof AVAILABLE_COUNTRIES)[number]['id']

export type Country = {
  id: CountryId
  name: string
  code: string
  flag: string
}

export const DEFAULT_COUNTRY_ID: CountryId = 'ar'

export const AVAILABLE_PROVINCES_BY_COUNTRY = {
  ar: ['Formosa', 'Resistencia', 'Corrientes'],
  py: ['Asunción'],
} as const satisfies Record<CountryId, readonly string[]>

export const AVAILABLE_SPORTS = [{ id: 'padel', label: 'Pádel' }] as const

export type SportId = (typeof AVAILABLE_SPORTS)[number]['id']

export type Sport = {
  id: SportId
  label: string
}

export const DEFAULT_SPORT_ID: SportId = 'padel'

export function availableProvincesFor(
  countryId: CountryId,
): readonly string[] {
  return AVAILABLE_PROVINCES_BY_COUNTRY[countryId]
}

export function defaultProvinceFor(countryId: CountryId): string {
  return availableProvincesFor(countryId)[0]
}

export function availableCountryById(countryId: CountryId): Country {
  const country = AVAILABLE_COUNTRIES.find((item) => item.id === countryId)
  if (!country) {
    throw new Error(`País no disponible: ${countryId}`)
  }
  return country
}

export function availableSportById(sportId: SportId): Sport {
  const sport = AVAILABLE_SPORTS.find((item) => item.id === sportId)
  if (!sport) {
    throw new Error(`Deporte no disponible: ${sportId}`)
  }
  return sport
}

export function sportLabel(sportId: SportId): string {
  return availableSportById(sportId).label
}

export function isCountryId(value: string): value is CountryId {
  return AVAILABLE_COUNTRIES.some((country) => country.id === value)
}

export function isSportId(value: string): value is SportId {
  return AVAILABLE_SPORTS.some((sport) => sport.id === value)
}

export function rankingLabel(province: string): string {
  return `Ranking ${province}`
}
