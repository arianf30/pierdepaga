'use client'

import { useMemo } from 'react'
import {
  clampProposalDateTime,
  formatProposalTimeSlot,
  getValidProposalDays,
  getValidProposalMonths,
  getValidProposalTimeSlots,
  getValidProposalYears,
  MONTH_LABELS,
  type ProposalDateTimeValue,
} from '@/lib/proposal-scheduling'
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

export function ProposalDateTimeField({
  value,
  onChange,
  error,
}: {
  value: ProposalDateTimeValue
  onChange: (next: ProposalDateTimeValue) => void
  error?: string | null
}) {
  const years = useMemo(() => getValidProposalYears(), [])
  const months = useMemo(() => getValidProposalMonths(value.year), [value.year])
  const days = useMemo(
    () => getValidProposalDays(value.year, value.month),
    [value.year, value.month],
  )
  const timeSlots = useMemo(
    () => getValidProposalTimeSlots(value.year, value.month, value.day),
    [value.year, value.month, value.day],
  )

  const timeValue = formatProposalTimeSlot(value)

  function update(partial: Partial<ProposalDateTimeValue>) {
    onChange(clampProposalDateTime({ ...value, ...partial }))
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-bold">Propuesta</h3>

      <div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-2">
        <FieldSelect
          id="proposal-day"
          label="Día"
          value={value.day}
          onChange={(next) => update({ day: Number(next) })}
          options={days.map((day) => ({
            value: String(day),
            label: String(day),
          }))}
        />
        <FieldSelect
          id="proposal-month"
          label="Mes"
          value={value.month}
          onChange={(next) => update({ month: Number(next) })}
          options={months.map((month) => ({
            value: String(month),
            label: MONTH_LABELS[month - 1],
          }))}
        />
        <FieldSelect
          id="proposal-year"
          label="Año"
          value={value.year}
          onChange={(next) => update({ year: Number(next) })}
          options={years.map((year) => ({
            value: String(year),
            label: String(year),
          }))}
        />
        <FieldSelect
          id="proposal-time"
          label="Hora"
          value={timeValue}
          onChange={(next) => {
            const [hour, minute] = next.split(':').map(Number)
            update({ hour, minute: minute as 0 | 30 })
          }}
          options={timeSlots.map((slot) => ({
            value: formatProposalTimeSlot(slot),
            label: formatProposalTimeSlot(slot),
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
