'use client'

import { Gift, Swords } from 'lucide-react'
import type { AccountType } from '@/lib/types/account'
import { cn } from '@/lib/utils'

function RoleOption({
  type,
  selected,
  onSelect,
}: {
  type: AccountType
  selected: boolean
  onSelect: () => void
}) {
  const isPlayer = type === 'jugador'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex flex-1 flex-col items-start rounded-2xl border px-4 py-4 text-left transition-all duration-200',
        isPlayer ? 'min-h-[7.5rem]' : 'min-h-[6.5rem] opacity-80 hover:opacity-100',
        selected && isPlayer
          ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/30 shadow-[0_0_32px_oklch(0.78_0.14_195/0.18)]'
          : selected && !isPlayer
            ? 'border-accent/45 bg-accent/8 ring-1 ring-accent/25'
            : 'border-border/80 bg-secondary/20 hover:border-border',
      )}
    >
      {selected && isPlayer && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}
      <span
        className={cn(
          'mb-3 grid place-items-center rounded-xl border',
          isPlayer ? 'size-10' : 'size-9',
          selected && isPlayer
            ? 'border-primary/40 bg-primary/15 text-primary'
            : selected && !isPlayer
              ? 'border-accent/35 bg-accent/10 text-accent'
              : 'border-border bg-background/40 text-muted-foreground',
        )}
      >
        {isPlayer ? (
          <Swords className="size-5" strokeWidth={2} />
        ) : (
          <Gift className="size-4" strokeWidth={2} />
        )}
      </span>
      <span
        className={cn(
          'font-display font-bold uppercase tracking-wide',
          isPlayer ? 'text-sm' : 'text-xs',
          selected && isPlayer && 'text-primary',
          selected && !isPlayer && 'text-accent',
          !selected && 'text-foreground',
        )}
      >
        {isPlayer ? 'Jugador' : 'Sponsor'}
      </span>
      <span className="mt-1 text-[11px] leading-snug text-muted-foreground">
        {isPlayer
          ? 'Competí, subí en el ranking y cargá partidos.'
          : 'Postulá premios para la comunidad.'}
      </span>
    </button>
  )
}

export function AccountTypePicker({
  value,
  onChange,
}: {
  value: AccountType
  onChange: (type: AccountType) => void
}) {
  return (
    <div className="flex gap-3">
      <RoleOption
        type="jugador"
        selected={value === 'jugador'}
        onSelect={() => onChange('jugador')}
      />
      <RoleOption
        type="sponsor"
        selected={value === 'sponsor'}
        onSelect={() => onChange('sponsor')}
      />
    </div>
  )
}
