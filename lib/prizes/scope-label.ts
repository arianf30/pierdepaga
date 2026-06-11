import {
  availableCountryById,
  sportLabel,
  type CountryId,
  type SportId,
} from '@/lib/catalog'

export function prizeScopeLabel(
  countryId: string,
  province: string,
  sportId: string,
): string {
  const country = availableCountryById(countryId as CountryId)
  const sport = sportLabel(sportId as SportId)
  return `${country.name} · ${province} · ${sport}`
}
