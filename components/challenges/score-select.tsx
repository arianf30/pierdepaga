'use client'

import { ChevronDown } from 'lucide-react'
import { PADEL_SET_SCORES } from '@/lib/padel-score'
import { cn } from '@/lib/utils'

export function ScoreSelect({
  id,
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  'aria-label'?: string
}) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={cn(
          'h-10 w-full cursor-pointer appearance-none rounded-lg border border-border bg-secondary/40 px-2 pr-7 text-center font-display text-lg font-bold tabular-nums outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-40',
          value ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        <option value="">–</option>
        {PADEL_SET_SCORES.map((score) => (
          <option key={score} value={String(score)}>
            {score}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
