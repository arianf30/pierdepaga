'use client'

import { useMemo } from 'react'
import {
  clampMatchDateTime,
  formatTimeSlot,
  getValidTimeSlots,
  MATCH_DAY_OPTIONS,
  type MatchDateTimeValue,
  type MatchDayOffset,
} from '@/lib/match-scheduling'
import { cn } from '@/lib/utils'

const labelClass = 'type-label mb-1.5 block text-[11px]'

const selectClass =
  'h-11 w-full min-w-0 appearance-none rounded-xl border border-border bg-secondary/40 px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/25'

function FieldSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: number | string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function MatchDateTimeField({
  value,
  onChange,
  error,
}: {
  value: MatchDateTimeValue
  onChange: (next: MatchDateTimeValue) => void
  error?: string | null
}) {
  const timeSlots = useMemo(
    () => getValidTimeSlots(value.dayOffset),
    [value.dayOffset],
  )

  const timeValue = formatTimeSlot(value)

  function update(partial: Partial<MatchDateTimeValue>) {
    onChange(clampMatchDateTime({ ...value, ...partial }))
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-bold">Fecha del partido</h3>

      <div className="grid grid-cols-2 gap-2">
        <FieldSelect
          id="match-day"
          label="Día"
          value={value.dayOffset}
          onChange={(next) =>
            update({ dayOffset: Number(next) as MatchDayOffset })
          }
          options={MATCH_DAY_OPTIONS.map((option) => ({
            value: String(option.offset),
            label: option.label,
          }))}
        />
        <FieldSelect
          id="match-time"
          label="Hora"
          value={timeValue}
          onChange={(next) => {
            const [hour, minute] = next.split(':').map(Number)
            update({ hour, minute: minute as 0 | 30 })
          }}
          options={timeSlots.map((slot) => ({
            value: formatTimeSlot(slot),
            label: formatTimeSlot(slot),
          }))}
        />
      </div>

      {error && (
        <p
          className={cn(
            'rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive',
          )}
        >
          {error}
        </p>
      )}
    </div>
  )
}
