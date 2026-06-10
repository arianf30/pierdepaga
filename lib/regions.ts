export type CountryId = 'ar' | 'py'

export type Country = {
  id: CountryId
  name: string
  code: string
  flag: string
}

export const COUNTRIES: Country[] = [
  { id: 'ar', name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  { id: 'py', name: 'Paraguay', code: 'PRY', flag: '🇵🇾' },
]

export const PROVINCES_BY_COUNTRY: Record<CountryId, string[]> = {
  ar: ['Formosa', 'Resistencia', 'Corrientes'],
  py: ['Asunción'],
}

export function provincesFor(countryId: CountryId): string[] {
  return PROVINCES_BY_COUNTRY[countryId]
}

export function rankingLabel(province: string): string {
  return `Ranking ${province}`
}
