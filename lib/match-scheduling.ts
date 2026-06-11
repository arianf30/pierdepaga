export type MatchDayOffset = 0 | 1 | 2

export type MatchDateTimeValue = {
  dayOffset: MatchDayOffset
  hour: number
  minute: 0 | 30
}

export const MATCH_DAY_OPTIONS: {
  offset: MatchDayOffset
  label: string
}[] = [
  { offset: 0, label: 'Hoy' },
  { offset: 1, label: 'Ayer' },
  { offset: 2, label: 'Antes de ayer' },
]

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDateForOffset(offset: MatchDayOffset, now = new Date()) {
  const date = startOfDay(now)
  date.setDate(date.getDate() - offset)
  return date
}

export function buildMatchDate(
  value: MatchDateTimeValue,
  now = new Date(),
): Date {
  const base = getDateForOffset(value.dayOffset, now)
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    value.hour,
    value.minute,
    0,
    0,
  )
}

export function getMatchDayLabel(offset: MatchDayOffset) {
  return MATCH_DAY_OPTIONS.find((option) => option.offset === offset)?.label ?? 'Hoy'
}

export function formatMatchDateTime(
  value: MatchDateTimeValue,
  now = new Date(),
): string {
  const hours = String(value.hour).padStart(2, '0')
  const minutes = String(value.minute).padStart(2, '0')
  return `${getMatchDayLabel(value.dayOffset)} · ${hours}:${minutes}`
}

export function isAllowedMinute(minute: number): minute is 0 | 30 {
  return minute === 0 || minute === 30
}

export function getValidTimeSlots(
  dayOffset: MatchDayOffset,
  now = new Date(),
): MatchDateTimeValue[] {
  const slots: MatchDateTimeValue[] = []

  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30] as const) {
      const slot = buildMatchDate({ dayOffset, hour, minute }, now)
      const isToday = dayOffset === 0
      const isValid = isToday
        ? slot.getTime() < now.getTime()
        : slot.getTime() <= now.getTime()

      if (isValid) {
        slots.push({ dayOffset, hour, minute })
      }
    }
  }

  return slots
}

export function validateMatchDateTime(
  value: MatchDateTimeValue,
  now = new Date(),
): string | null {
  if (!Number.isInteger(value.dayOffset) || value.dayOffset < 0 || value.dayOffset > 2) {
    return 'Elegí cuándo se jugó el partido.'
  }

  if (!Number.isInteger(value.hour)) {
    return 'Elegí la hora del partido.'
  }

  if (!isAllowedMinute(value.minute)) {
    return 'La hora debe ser en punto o y media.'
  }

  if (value.hour < 0 || value.hour > 23) {
    return 'Elegí una hora válida.'
  }

  const date = buildMatchDate(value, now)

  if (value.dayOffset === 0 && date.getTime() >= now.getTime()) {
    return 'Si fue hoy, la hora debe ser anterior a la actual.'
  }

  if (date.getTime() > now.getTime()) {
    return 'El partido no puede ser en el futuro.'
  }

  const earliest = getDateForOffset(2, now)
  if (date.getTime() < earliest.getTime()) {
    return 'Solo podés cargar partidos de hoy, ayer o antes de ayer.'
  }

  const validSlots = getValidTimeSlots(value.dayOffset, now)
  const isValidSlot = validSlots.some(
    (slot) => slot.hour === value.hour && slot.minute === value.minute,
  )

  if (!isValidSlot) {
    return 'Elegí una hora válida para ese día.'
  }

  return null
}

export function getDefaultMatchDateTime(now = new Date()): MatchDateTimeValue {
  const todaySlots = getValidTimeSlots(0, now)
  if (todaySlots.length > 0) {
    return todaySlots[todaySlots.length - 1]
  }

  return { dayOffset: 1, hour: 20, minute: 0 }
}

export function clampMatchDateTime(
  value: MatchDateTimeValue,
  now = new Date(),
): MatchDateTimeValue {
  const dayOffset = ([0, 1, 2] as const).includes(value.dayOffset)
    ? value.dayOffset
    : 0

  const slots = getValidTimeSlots(dayOffset, now)
  if (slots.length === 0) {
    return getDefaultMatchDateTime(now)
  }

  const match = slots.find(
    (slot) => slot.hour === value.hour && slot.minute === value.minute,
  )

  return match ?? slots[slots.length - 1]
}

export function formatTimeSlot(value: Pick<MatchDateTimeValue, 'hour' | 'minute'>) {
  return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`
}
