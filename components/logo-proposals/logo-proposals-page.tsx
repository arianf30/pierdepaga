'use client'

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Atmosphere } from '@/components/atmosphere'
import { LOGO_CONCEPTS } from '@/lib/logo-proposals'
import { TypeWordmark } from '@/components/logo-proposals/wordmark-concepts'

function ConceptSection({
  concept,
}: {
  concept: (typeof LOGO_CONCEPTS)[number]
}) {
  const {
    id,
    number,
    title,
    subtitle,
    fontVar,
    fontLabel,
    accent,
    accentLabel,
    rationale,
    keywords,
  } = concept

  const wm = { concept: id, accent, fontVar }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card/40">
      <div className="border-b border-border px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="type-kicker">Concepto {number}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Tipografía · {fontLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-border lg:grid-cols-2">
        {/* Dark background */}
        <div className="bg-[#0A0C10] p-8 sm:p-12">
          <p className="type-label mb-8 text-white/40">Fondo oscuro</p>
          <TypeWordmark {...wm} size="lg" />
          <div className="mt-10 flex items-center gap-3 text-xs text-white/35">
            <span className="size-3 rounded-full" style={{ background: accent }} />
            Acento · {accentLabel}
          </div>
        </div>

        {/* Light background */}
        <div className="bg-[#F5F5F5] p-8 sm:p-12">
          <p className="type-label mb-8 text-black/40">Fondo claro</p>
          <TypeWordmark {...wm} size="lg" onLight />
        </div>

        {/* Mobile splash */}
        <div className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden bg-[#0A0C10] p-8 sm:col-span-2">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${accent}, transparent 65%)`,
            }}
          />
          <p className="type-label absolute left-8 top-8 text-white/40">
            Mobile splash screen
          </p>
          <div className="relative flex flex-col items-center text-center">
            <TypeWordmark {...wm} size="xl" />
            <p className="mt-8 max-w-xs text-xs uppercase tracking-[0.28em] text-white/35">
              El que pierde, paga
            </p>
          </div>
          <div className="absolute bottom-8 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/15" />
        </div>

        {/* Tournament banner */}
        <div
          className="relative flex min-h-[200px] items-center overflow-hidden p-8 sm:col-span-2 lg:min-h-[160px]"
          style={{
            background: `linear-gradient(105deg, #0A0C10 0%, #0A0C10 55%, ${accent}18 100%)`,
          }}
        >
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-30"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}40)`,
            }}
          />
          <p className="type-label absolute left-8 top-6 text-white/40">
            Tournament banner
          </p>
          <div className="relative mt-6 flex w-full flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center sm:justify-between">
            <TypeWordmark {...wm} size="md" />
            <div className="text-right">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40"
                style={{ fontFamily: `var(${fontVar})` }}
              >
                Grand Slam Series
              </p>
              <p
                className="mt-1 text-sm font-semibold text-white/80"
                style={{ fontFamily: `var(${fontVar})` }}
              >
                Buenos Aires · 2026
              </p>
            </div>
          </div>
        </div>

        {/* Monochrome pair */}
        <div className="grid gap-px bg-border sm:grid-cols-2 sm:col-span-2">
          <div className="bg-black p-8 sm:p-10">
            <p className="type-label mb-6 text-white/40">Monocromo · negro</p>
            <TypeWordmark {...wm} size="md" mono />
          </div>
          <div className="bg-white p-8 sm:p-10">
            <p className="type-label mb-6 text-black/40">Monocromo · blanco</p>
            <TypeWordmark {...wm} size="md" mono onLight />
          </div>
        </div>
      </div>

      <div className="border-t border-border px-6 py-6 sm:px-8">
        <p className="type-label mb-4">Rationale de marca</p>
        <ul className="space-y-3">
          {rationale.map((line) => (
            <li
              key={line}
              className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
            >
              <Sparkles
                className="mt-0.5 size-4 shrink-0"
                style={{ color: accent }}
              />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function LogoProposalsPage() {
  return (
    <div className="relative min-h-screen">
      <Atmosphere />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a la app
        </Link>

        <header className="mb-12 max-w-3xl">
          <p className="type-kicker">Identidad tipográfica</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Wordmarks PierdePaga
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Cinco propuestas exclusivamente tipográficas. Sin íconos, sin
            símbolos, sin ilustraciones. La letra es el logo — pensado para
            competir con PlayStation, Nike, F1 y marcas globales de
            entretenimiento deportivo.
          </p>
          <p className="mt-3 text-sm font-medium text-foreground/80">
            Tipografía primero. Calidad de agencia. Escala corporativa.
          </p>
        </header>

        <div className="space-y-10">
          {LOGO_CONCEPTS.map((concept) => (
            <ConceptSection key={concept.id} concept={concept} />
          ))}
        </div>

        <footer className="mt-12 rounded-2xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
          Página temporal de exploración. Elegí una dirección tipográfica y la
          refinamos para producción: app, sponsors, torneos y merch.
        </footer>
      </div>
    </div>
  )
}
