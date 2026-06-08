import { cn } from '@/lib/utils'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** full: wordmark + regla · compact: monograma P/P */
  variant?: 'full' | 'wordmark' | 'compact' | 'mark'
  onLight?: boolean
  className?: string
}

const sizeConfig = {
  sm: {
    text: 'text-base',
    rule: 'h-[2.5px]',
    gap: 'gap-[0.3em]',
    monogram: 'text-base',
  },
  md: {
    text: 'text-xl',
    rule: 'h-[3px]',
    gap: 'gap-[0.32em]',
    monogram: 'text-xl',
  },
  lg: {
    text: 'text-[2rem] sm:text-[2.5rem]',
    rule: 'h-[3.5px]',
    gap: 'gap-[0.35em]',
    monogram: 'text-2xl',
  },
  xl: {
    text: 'text-[2.5rem]',
    rule: 'h-1',
    gap: 'gap-[0.35em]',
    monogram: 'text-[1.75rem]',
  },
} as const

function VelocityWordmark({
  size,
  showRule,
  onLight,
  className,
}: {
  size: keyof typeof sizeConfig
  showRule: boolean
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
          'font-bold italic uppercase tracking-tight',
          cfg.text,
          pierde,
        )}
      >
        <span>Pierde</span>
        <span className="mx-[0.12em] font-normal not-italic opacity-40">
          /
        </span>
        <span className="text-primary">Paga</span>
      </span>
      {showRule && (
        <span
          className={cn('w-full rounded-full bg-primary', cfg.rule)}
          aria-hidden
        />
      )}
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
        'inline-flex font-logo font-bold italic uppercase leading-none tracking-tight text-foreground',
        cfg.monogram,
        className,
      )}
      aria-label="PierdePaga"
    >
      P<span className="font-normal not-italic opacity-40">/</span>
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

  const showRule = variant === 'full' || variant === 'wordmark'

  return (
    <VelocityWordmark
      size={size}
      showRule={showRule}
      onLight={onLight}
      className={className}
    />
  )
}
