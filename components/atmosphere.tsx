'use client'

import { useMemo } from 'react'

export function Atmosphere() {
  const particles = useMemo(() => {
    // Deterministic pseudo-random so server and client render identically (no hydration mismatch).
    let seed = 1337
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: rand() * 100,
      bottom: rand() * 40,
      size: rand() * 3 + 1.5,
      duration: rand() * 12 + 10,
      delay: rand() * 12,
      gold: rand() > 0.6,
    }))
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base vignette */}
      <div className="absolute inset-0 bg-background" />
      {/* ambient glows */}
      <div className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full bg-[var(--energy)] opacity-[0.10] blur-[140px]" />
      <div className="absolute right-[-15%] top-[20%] h-[600px] w-[600px] rounded-full bg-[var(--gold)] opacity-[0.07] blur-[150px]" />
      <div className="absolute bottom-[-20%] left-1/3 h-[520px] w-[520px] rounded-full bg-[var(--energy)] opacity-[0.06] blur-[150px]" />
      {/* light ray */}
      <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-[var(--energy)]/20 via-transparent to-transparent blur-[2px]" />
      {/* grid */}
      <div className="grid-texture absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      {/* particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            background: p.gold ? 'var(--gold)' : 'var(--energy)',
            boxShadow: `0 0 8px ${p.gold ? 'var(--gold)' : 'var(--energy)'}`,
            animation: `float-particle ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
    </div>
  )
}
