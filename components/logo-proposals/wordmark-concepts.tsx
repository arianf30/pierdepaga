import { cn } from '@/lib/utils'
import type { LogoConceptId } from '@/lib/logo-proposals'

export type WordmarkProps = {
  concept: LogoConceptId
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onLight?: boolean
  mono?: boolean
  accent?: string
  fontVar?: string
  className?: string
}

const sizes = {
  sm: 'scale-[0.72] origin-left',
  md: 'scale-100 origin-left',
  lg: 'scale-[1.35] origin-left',
  xl: 'scale-[1.85] origin-left',
} as const

function fontFamily(fontVar: string) {
  return `var(${fontVar}), var(--font-inter), system-ui, sans-serif`
}

function LuxuryWordmark({
  onLight,
  mono,
  accent,
  fontVar,
}: Omit<WordmarkProps, 'concept' | 'size' | 'className'>) {
  const muted = onLight ? 'text-black/45' : 'text-white/45'
  const solid = onLight ? 'text-black' : 'text-white'

  return (
    <span
      className="inline-flex flex-col leading-[0.92]"
      style={{ fontFamily: fontFamily(fontVar!) }}
    >
      <span
        className={cn(
          'text-[0.55em] font-normal uppercase',
          mono ? solid : muted,
        )}
        style={{ letterSpacing: '0.52em', marginRight: '-0.52em' }}
      >
        Pierde
      </span>
      <span
        className={cn('text-[1em] font-semibold uppercase', mono && solid)}
        style={{
          letterSpacing: '0.38em',
          marginRight: '-0.38em',
          ...(mono ? {} : { color: accent }),
        }}
      >
        Paga
      </span>
    </span>
  )
}

function TechnologyWordmark({
  onLight,
  mono,
  accent,
  fontVar,
}: Omit<WordmarkProps, 'concept' | 'size' | 'className'>) {
  const light = onLight ? 'text-black/50' : 'text-white/50'
  const dark = onLight ? 'text-black' : 'text-white'

  return (
    <span
      className="inline-flex items-baseline text-[1em]"
      style={{ fontFamily: fontFamily(fontVar!) }}
    >
      <span
        className={cn(mono ? dark : light)}
        style={{ fontWeight: 400, letterSpacing: '-0.055em' }}
      >
        Pierde
      </span>
      <span
        className={cn(mono ? dark : '')}
        style={{
          fontWeight: 600,
          letterSpacing: '-0.02em',
          marginLeft: '0.04em',
          ...(mono ? {} : { color: accent }),
        }}
      >
        Paga
      </span>
    </span>
  )
}

function LeagueWordmark({
  onLight,
  mono,
  accent,
  fontVar,
}: Omit<WordmarkProps, 'concept' | 'size' | 'className'>) {
  const base = onLight ? 'text-black' : 'text-white'

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-[0.18em] text-[1em] font-bold uppercase tracking-tight',
        mono && base,
      )}
      style={{
        fontFamily: fontFamily(fontVar!),
        fontStretch: 'condensed',
      }}
    >
      <span>Pierde</span>
      <span
        className={cn('font-normal', mono ? 'opacity-50' : '')}
        style={mono ? {} : { color: accent }}
        aria-hidden
      >
        ·
      </span>
      <span style={mono ? {} : { color: accent }}>Paga</span>
    </span>
  )
}

function PlaystationWordmark({
  onLight,
  mono,
  fontVar,
}: Omit<WordmarkProps, 'concept' | 'size' | 'className'>) {
  const pierde = onLight ? 'text-black/40' : 'text-white/38'
  const paga = mono
    ? onLight
      ? 'text-black'
      : 'text-white'
    : onLight
      ? 'text-black'
      : 'text-white'

  return (
    <span
      className="inline-flex items-baseline text-[1em] font-semibold tracking-[-0.04em]"
      style={{ fontFamily: fontFamily(fontVar!) }}
    >
      <span className={pierde}>pierde</span>
      <span className={paga}>paga</span>
    </span>
  )
}

function FormulaWordmark({
  onLight,
  mono,
  accent,
  fontVar,
}: Omit<WordmarkProps, 'concept' | 'size' | 'className'>) {
  const text = onLight ? 'text-black' : 'text-white'

  return (
    <span
      className="inline-flex flex-col gap-[0.35em]"
      style={{ fontFamily: fontFamily(fontVar!) }}
    >
      <span
        className={cn(
          'text-[1em] font-bold italic uppercase tracking-tight',
          mono && text,
        )}
        style={{ fontStyle: 'italic' }}
      >
        <span>Pierde</span>
        <span className="mx-[0.12em] font-normal not-italic opacity-40">
          /
        </span>
        <span style={mono ? {} : { color: accent }}>Paga</span>
      </span>
      <span
        className="h-[3px] w-full max-w-[100%]"
        style={{ background: mono ? (onLight ? '#000' : '#fff') : accent }}
        aria-hidden
      />
    </span>
  )
}

export function TypeWordmark({
  concept,
  size = 'md',
  onLight = false,
  mono = false,
  accent = '#FAFAFA',
  fontVar = '--font-display',
  className,
}: WordmarkProps) {
  const props = { onLight, mono, accent, fontVar }

  return (
    <div
      className={cn('inline-block text-[2rem] sm:text-[2.5rem]', sizes[size], className)}
    >
      {concept === 'luxury' && <LuxuryWordmark {...props} />}
      {concept === 'technology' && <TechnologyWordmark {...props} />}
      {concept === 'league' && <LeagueWordmark {...props} />}
      {concept === 'playstation' && <PlaystationWordmark {...props} />}
      {concept === 'formula' && <FormulaWordmark {...props} />}
    </div>
  )
}
