import { cn } from '@/lib/utils'

const labelClass = 'type-label mb-1.5 block text-[11px]'

export function LockedPlayerField({
  label,
  name,
  avatar,
  variant = 'primary',
}: {
  label: string
  name: string
  avatar: string
  variant?: 'primary' | 'accent'
}) {
  const isAccent = variant === 'accent'

  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      <div
        className={cn(
          'flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2',
          isAccent
            ? 'border-accent/25 bg-accent/10'
            : 'border-primary/25 bg-primary/10',
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar || '/placeholder.svg'}
          alt=""
          className={cn(
            'size-7 shrink-0 rounded-lg object-cover ring-1',
            isAccent ? 'ring-accent/30' : 'ring-primary/30',
          )}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {name}
        </span>
        <span
          className={cn(
            'type-badge shrink-0 rounded-md px-1.5 py-0.5 text-[8px]',
            isAccent
              ? 'bg-accent text-accent-foreground'
              : 'bg-primary text-primary-foreground',
          )}
        >
          Vos
        </span>
      </div>
    </div>
  )
}
