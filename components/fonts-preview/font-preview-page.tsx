'use client'

import Link from 'next/link'
import { Flame, Trophy, ArrowLeft } from 'lucide-react'
import { Atmosphere } from '@/components/atmosphere'
import type { FontPreviewOption } from '@/lib/fonts/preview-catalog'

function displayFont(variable: string) {
  return `var(${variable}), var(--font-inter), system-ui, sans-serif`
}

function FontPreviewCard({ option }: { option: FontPreviewOption }) {
  const family = displayFont(option.variable)
  const isDisplayOnly = option.id === 'bebas-neue'
  const titleClass = isDisplayOnly
    ? 'text-3xl font-normal uppercase leading-none tracking-wide sm:text-4xl'
    : 'text-2xl font-semibold leading-tight tracking-tight sm:text-3xl'
  const logoClass = isDisplayOnly
    ? 'text-base font-normal uppercase tracking-wider'
    : 'text-sm font-semibold'

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card/60">
      {/* Mini topbar */}
      <div className="flex items-center justify-between border-b border-border glass px-4 py-3">
        <span
          className={`${logoClass} text-foreground`}
          style={{ fontFamily: family }}
        >
          Pierde<span className="text-primary">Paga</span>
        </span>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
          Temporada 4
        </span>
      </div>

      {/* Mini hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/arena-hero.png"
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        </div>
        <div className="relative p-5">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
            <Flame className="size-3" /> Racha de 6 victorias
          </span>
          <h2
            className={`${titleClass} text-foreground`}
            style={{ fontFamily: family }}
          >
            Bienvenido de vuelta,
            <br />
            <span className="text-primary">Marco Vidal</span>
          </h2>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Estás en el puesto <span className="font-semibold text-accent">#7</span>{' '}
            del ranking global. El cuerpo sigue en Inter.
          </p>
        </div>
      </div>

      {/* Mini section + stat */}
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Ranking
          </p>
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: family }}
          >
            Tabla global
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Cuerpo en Inter — párrafo de ejemplo.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
          <p
            className="text-3xl font-bold tabular-nums text-primary"
            style={{ fontFamily: family }}
          >
            2480
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Rating
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="border-t border-border bg-secondary/20 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-base font-semibold text-foreground"
              style={{ fontFamily: family }}
            >
              {option.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{option.vibe}</p>
          </div>
          <span className="shrink-0 rounded-lg border border-border bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground">
            #{option.id}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-primary/80">
          <Trophy className="mr-1 inline size-3" />
          {option.bestFor}
        </p>
      </div>
    </article>
  )
}

export function FontPreviewPage({ options }: { options: FontPreviewOption[] }) {
  return (
    <div className="relative min-h-screen">
      <Atmosphere />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6">
        <div className="mb-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver a la app
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            Página temporal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Elegí la tipografía de títulos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Ocho opciones para <strong className="text-foreground">logo y títulos</strong>:
            Arimo, Iosevka Charon, Manrope, Bebas Neue, Saira, Bricolage Grotesque, Jost y
            Archivo. El cuerpo se queda en{' '}
            <strong className="text-foreground">Inter</strong>.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {options.map((option) => (
            <FontPreviewCard key={option.id} option={option} />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Cuando elijas una, la aplicamos como{' '}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-foreground">font-display</code>{' '}
          y esta página se puede borrar.
        </p>
      </div>
    </div>
  )
}
