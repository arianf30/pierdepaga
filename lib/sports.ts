export type SportId = 'padel'

export type Sport = {
  id: SportId
  label: string
}

export const SPORTS: Sport[] = [
  { id: 'padel', label: 'Pádel' },
]

export function sportLabel(id: SportId): string {
  return SPORTS.find((sport) => sport.id === id)?.label ?? 'Pádel'
}
