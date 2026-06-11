import Image from 'next/image'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'rail'
  /** Conservado por compatibilidad; siempre usa pierdepaga-logo.png */
  variant?: 'full' | 'wordmark' | 'compact' | 'mark'
  onLight?: boolean
  className?: string
}

const LOGO = {
  src: '/brand/pierdepaga-logo.png',
  width: 943,
  height: 408,
} as const

const sizeConfig = {
  rail: 24,
  sm: 22,
  md: 32,
  lg: 48,
  xl: 36,
} as const

export function BrandLogo({
  size = 'md',
  className,
}: BrandLogoProps) {
  const height = sizeConfig[size]
  const width = Math.round((height * LOGO.width) / LOGO.height)

  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-start leading-none',
        className,
      )}
      style={{ height, width }}
      aria-label="PierdePaga"
    >
      <Image
        src={LOGO.src}
        alt=""
        width={width}
        height={height}
        unoptimized
        priority={size === 'lg' || size === 'rail'}
        className="block size-full object-contain object-left"
      />
    </span>
  )
}
