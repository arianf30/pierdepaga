import { cn } from '@/lib/utils'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** full: wordmark · compact: monograma P$P */
  variant?: 'full' | 'wordmark' | 'compact' | 'mark'
  onLight?: boolean
  className?: string
}

const sizeConfig = {
  sm: {
    text: 'text-base',
    gap: 'gap-[0.3em]',
    monogram: 'text-base',
    symbol: 'text-sm',
  },
  md: {
    text: 'text-xl',
    gap: 'gap-[0.32em]',
    monogram: 'text-xl',
    symbol: 'text-base',
  },
  lg: {
    text: 'text-[2rem] sm:text-[2.5rem]',
    gap: 'gap-[0.35em]',
    monogram: 'text-2xl',
    symbol: 'text-xl',
  },
  xl: {
    text: 'text-[2.5rem]',
    gap: 'gap-[0.35em]',
    monogram: 'text-[1.75rem]',
    symbol: 'text-2xl',
  },
} as const

function LogoSymbol({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'mx-[0.1em] inline-block font-normal not-italic leading-none text-muted-foreground opacity-50',
        className,
      )}
      aria-hidden
    >
      $
    </span>
  )
}

function VelocityWordmark({
  size,
  onLight,
  className,
}: {
  size: keyof typeof sizeConfig
  onLight?: boolean
  className?: string
}) {
  const cfg = sizeConfig[size]
  const pierde = onLight ? 'text-black' : 'text-foreground'

  return (
    <span
      className={cn('inline-flex flex-col font-logo', cfg.gap, className)}
      aria-label="PierdePaga"
    >
      <span
        className={cn(
          'inline-flex items-baseline font-bold italic uppercase tracking-tight',
          cfg.text,
          pierde,
        )}
      >
        <span>Pierde</span>
        <LogoSymbol className={cfg.symbol} />
        <span className="text-primary">Paga</span>
      </span>
    </span>
  )
}

function VelocityMonogram({
  size,
  className,
}: {
  size: keyof typeof sizeConfig
  className?: string
}) {
  const cfg = sizeConfig[size]

  return (
    <span
      className={cn(
        'inline-flex items-baseline font-logo font-bold italic uppercase leading-none tracking-tight text-foreground',
        cfg.monogram,
        className,
      )}
      aria-label="PierdePaga"
    >
      P
      <LogoSymbol className={cfg.symbol} />
      <span className="text-primary">P</span>
    </span>
  )
}

export function BrandLogo({
  size = 'md',
  variant = 'full',
  onLight = false,
  className,
}: BrandLogoProps) {
  if (variant === 'compact' || variant === 'mark') {
    return <VelocityMonogram size={size} className={className} />
  }

  return (
    <VelocityWordmark
      size={size}
      onLight={onLight}
      className={className}
    />
  )
}
