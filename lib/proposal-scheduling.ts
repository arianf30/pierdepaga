export type ProposalDateTimeValue = {
  day: number
  month: number
  year: number
  hour: number
  minute: 0 | 30
}

export const PROPOSAL_MAX_DAYS = 7

export const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function getProposalDateBounds(now = new Date()) {
  const min = getNextProposalSlot(now)
  const max = new Date(now)
  max.setDate(max.getDate() + PROPOSAL_MAX_DAYS)
  max.setHours(23, 59, 59, 999)
  return { min, max, now }
}

export function getNextProposalSlot(now = new Date()) {
  const slot = new Date(now)
  if (slot.getMinutes() < 30) {
    slot.setMinutes(30, 0, 0)
  } else {
    slot.setHours(slot.getHours() + 1, 0, 0, 0)
  }

  if (slot.getTime() <= now.getTime()) {
    slot.setMinutes(slot.getMinutes() + 30)
  }

  return slot
}

export function buildProposalDate(
  value: ProposalDateTimeValue,
  now = new Date(),
): Date {
  return new Date(
    value.year,
    value.month - 1,
    value.day,
    value.hour,
    value.minute,
    0,
    0,
  )
}

export function formatProposalDateTime(value: ProposalDateTimeValue): string {
  const hours = String(value.hour).padStart(2, '0')
  const minutes = String(value.minute).padStart(2, '0')
  return `${value.day} ${MONTH_LABELS[value.month - 1]} ${value.year} · ${hours}:${minutes}`
}

export function isAllowedMinute(minute: number): minute is 0 | 30 {
  return minute === 0 || minute === 30
}

export function getValidProposalYears(now = new Date()) {
  const { min, max } = getProposalDateBounds(now)
  const years: number[] = []
  for (let year = min.getFullYear(); year <= max.getFullYear(); year += 1) {
    years.push(year)
  }
  return years
}

export function getValidProposalMonths(year: number, now = new Date()) {
  const { min, max } = getProposalDateBounds(now)
  const months: number[] = []

  for (let month = 1; month <= 12; month += 1) {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)
    if (monthEnd.getTime() >= min.getTime() && monthStart.getTime() <= max.getTime()) {
      months.push(month)
    }
  }

  return months
}

export function getValidProposalDays(year: number, month: number, now = new Date()) {
  const { min, max } = getProposalDateBounds(now)
  const total = new Date(year, month, 0).getDate()
  const days: number[] = []

  for (let day = 1; day <= total; day += 1) {
    const dayStart = new Date(year, month - 1, day)
    const dayEnd = endOfDay(dayStart)
    if (dayEnd.getTime() >= min.getTime() && dayStart.getTime() <= max.getTime()) {
      days.push(day)
    }
  }

  return days
}

export function getValidProposalTimeSlots(
  year: number,
  month: number,
  day: number,
  now = new Date(),
): ProposalDateTimeValue[] {
  const { min, max } = getProposalDateBounds(now)
  const slots: ProposalDateTimeValue[] = []

  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30] as const) {
      const slot = buildProposalDate({ day, month, year, hour, minute }, now)
      if (slot.getTime() >= min.getTime() && slot.getTime() <= max.getTime()) {
        slots.push({ day, month, year, hour, minute })
      }
    }
  }

  return slots
}

export function validateProposalDateTime(
  value: ProposalDateTimeValue,
  now = new Date(),
): string | null {
  const { min, max } = getProposalDateBounds(now)

  if (
    !Number.isInteger(value.day) ||
    !Number.isInteger(value.month) ||
    !Number.isInteger(value.year) ||
    !Number.isInteger(value.hour)
  ) {
    return 'Completá la propuesta de fecha y hora.'
  }

  if (!isAllowedMinute(value.minute)) {
    return 'La hora debe ser en punto o y media.'
  }

  const date = buildProposalDate(value, now)

  if (date.getTime() < min.getTime()) {
    return 'La propuesta debe ser en el futuro.'
  }

  if (date.getTime() > max.getTime()) {
    return 'La propuesta no puede superar 1 semana.'
  }

  const validSlots = getValidProposalTimeSlots(
    value.year,
    value.month,
    value.day,
    now,
  )
  const isValidSlot = validSlots.some(
    (slot) => slot.hour === value.hour && slot.minute === value.minute,
  )

  if (!isValidSlot) {
    return 'Elegí una hora válida para esa fecha.'
  }

  return null
}

export function getDefaultProposalDateTime(now = new Date()): ProposalDateTimeValue {
  const next = getNextProposalSlot(now)
  return {
    day: next.getDate(),
    month: next.getMonth() + 1,
    year: next.getFullYear(),
    hour: next.getHours(),
    minute: (next.getMinutes() as 0 | 30) ?? 0,
  }
}

export function clampProposalDateTime(
  value: ProposalDateTimeValue,
  now = new Date(),
): ProposalDateTimeValue {
  const years = getValidProposalYears(now)
  const year = years.includes(value.year) ? value.year : years[0]

  const months = getValidProposalMonths(year, now)
  const month = months.includes(value.month) ? value.month : months[0]

  const days = getValidProposalDays(year, month, now)
  const day = days.includes(value.day) ? value.day : days[0]

  const slots = getValidProposalTimeSlots(year, month, day, now)
  if (slots.length === 0) {
    return getDefaultProposalDateTime(now)
  }

  const match = slots.find(
    (slot) => slot.hour === value.hour && slot.minute === value.minute,
  )

  return match ?? slots[0]
}

export function formatProposalTimeSlot(
  value: Pick<ProposalDateTimeValue, 'hour' | 'minute'>,
) {
  return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`
}
