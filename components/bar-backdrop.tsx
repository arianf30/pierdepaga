'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Alpha explícito — color-mix rompe backdrop-filter en Safari/Chrome */
export const barBackdropStyle: CSSProperties = {
  backgroundColor: 'oklch(0.21 0.015 240 / 0.55)',
  WebkitBackdropFilter: 'blur(64px) saturate(180%)',
  backdropFilter: 'blur(64px) saturate(180%)',
}

export function BackdropBlur({
  edge,
  className,
}: {
  edge: 'top' | 'bottom'
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0',
        edge === 'top' ? 'border-b border-border' : 'border-t border-border',
        className,
      )}
      style={barBackdropStyle}
    />
  )
}

export function useIsLg() {
  const [isLg, setIsLg] = useState<boolean | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsLg(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isLg
}

export function MobilePortal({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!enabled || !mounted) return <>{children}</>
  return createPortal(children, document.body)
}
