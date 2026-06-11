'use client'

import { type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const selectValueClass =
  'font-display text-xs font-semibold uppercase tracking-[0.14em] text-foreground'

const shellClass =
  'group relative h-11 overflow-hidden rounded-xl border border-border/80 bg-secondary/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,background-color,box-shadow] hover:border-primary/35 hover:bg-secondary/70 has-[:focus-visible]:border-primary/50 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-primary/25'

export function SelectShell({
  label,
  className,
  children,
  value,
  onChange,
  options,
  flagOnly = false,
}: {
  label: string
  className?: string
  children: ReactNode
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  flagOnly?: boolean
}) {
  return (
    <div className={cn(shellClass, className)}>
      <div
        className={cn(
          'flex h-full items-center',
          flagOnly ? 'justify-center px-0' : 'gap-2.5 pl-3.5 pr-10',
        )}
      >
        {children}
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 z-10 cursor-pointer appearance-none opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {!flagOnly && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-xl border-l border-border/50 bg-black/10"
          aria-hidden
        >
          <ChevronDown className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
        </div>
      )}
    </div>
  )
}
