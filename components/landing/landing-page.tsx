'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronRight,
  Crown,
  Flame,
  Gift,
  History,
  Medal,
  Minus,
  Search,
  Shield,
  Swords,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import { StreakBadge } from '@/components/arena/streak-badge'
import { Atmosphere } from '@/components/atmosphere'
import { BrandLogo } from '@/components/brand-logo'
import { AccentButton, fadeUp, PrimaryButton } from '@/components/ui-kit'
import { leaderboard } from '@/lib/data'
import { playerPublicName } from '@/lib/player-names'
import { routes } from '@/lib/routes'
import { formatSkill, playerSkill } from '@/lib/skill'
import { formatStreakValue } from '@/lib/streaks'
import { cn } from '@/lib/utils'

const STATS = [
  { value: '2.400+', label: 'Jugadores activos' },
  { value: '18k', label: 'Partidos cargados' },
  { value: '340+', label: 'Premios entregados' },
] as const

const FEATURES = [
  {
    icon: Trophy,
    title: 'Ranking por premios',
    description:
      'Escalá el ranking de tu provincia y desbloqueá premios por racha, podio y logros. Gratis para jugar, con recompensas reales.',
    tone: 'primary' as const,
  },
  {
    icon: Swords,
    title: 'Pierde paga',
    description:
      'Proponé desafíos con apuesta. El perdedor paga la cancha. Presión máxima para partidos que valen plata.',
    tone: 'accent' as const,
  },
  {
    icon: History,
    title: 'Partidos simples',
    description:
      'Cargá resultados, confirmá con los jugadores y construí un historial verificable de todo lo que jugaste.',
    tone: 'primary' as const,
  },
] as const

const STEPS = [
  {
    step: '01',
    title: 'Creá tu perfil',
    detail:
      'Es gratis. Nombre para mostrar, habilidad y provincia. Tu carta de jugador en PierdePaga.',
  },
  {
    step: '02',
    title: 'Buscá rivales',
    detail: 'Filtrá por nivel ±200 pts y armá desafíos pierde paga o partidos simples.',
  },
  {
    step: '03',
    title: 'Jugá y confirmá',
    detail: 'Tu equipo valida el resultado. 3 de 4 confirman y el partido queda oficial.',
  },
  {
    step: '04',
    title: 'Escalá el ranking',
    detail: 'Ganá habilidad, premios por racha y el respeto de toda tu provincia.',
  },
] as const

const HERO_RANKING = leaderboard.slice(0, 5)

/** Rachas de demo: 2 fuegos distintos + 1 hielito */
const HERO_STREAKS: Record<string, number> = {
  p2: 3, // fuego suave
  p3: 8, // fuego intenso (rayo)
  p4: -7, // hielito fuerte
  p9: -1, // Vale
  p5: 1, // Tomás
}

function heroStreak(playerId: string, fallback: number) {
  return HERO_STREAKS[playerId] ?? fallback
}

function RankDeltaMini({ delta }: { delta: number }) {
  if (delta > 0) {
    return <TrendingUp className="size-2.5 shrink-0 text-primary" aria-hidden />
  }
  if (delta < 0) {
    return (
      <TrendingUp
        className="size-2.5 shrink-0 rotate-180 text-destructive"
        aria-hidden
      />
    )
  }
  return <Minus className="size-2.5 shrink-0 text-muted-foreground/50" aria-hidden />
}

function HeroRankingPreview() {
  return (
    <div className="rounded-3xl border border-border glass p-4 shadow-[0_0_60px_oklch(0.78_0.14_195/0.12)] sm:p-5">
      <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-3">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-destructive/70" />
          <span className="size-2 rounded-full bg-accent/70" />
          <span className="size-2 rounded-full bg-primary/70" />
        </div>
        <span className="mx-auto truncate text-[10px] text-muted-foreground">
          pierdepaga.app/ranking
        </span>
      </div>

      <p className="text-sm font-semibold tracking-tight">Ranking Formosa</p>

      <div className="relative mt-2.5">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted-foreground" />
        <div className="rounded-lg border border-border bg-secondary/30 px-7 py-2 text-[10px] text-muted-foreground">
          Buscar jugador...
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card/50">
        <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.5rem_3.25rem] items-center gap-2 border-b border-border/50 bg-secondary/20 px-3 py-2">
          <span className="type-label text-[8px]">#</span>
          <span className="type-label text-[8px]">Jugador</span>
          <span className="type-label text-center text-[8px]">Racha</span>
          <span className="type-label text-right text-[8px]">Hab.</span>
        </div>
        <div className="divide-y divide-border/40">
          {HERO_RANKING.map((player, index) => {
            const streak = heroStreak(player.id, player.streak)

            return (
            <div
              key={player.id}
              className={cn(
                'grid grid-cols-[2.25rem_minmax(0,1fr)_2.5rem_3.25rem] items-center gap-2 px-3 py-2',
                index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent',
              )}
            >
              <div className="flex items-center justify-center gap-0.5">
                <span
                  className={cn(
                    'font-display text-[11px] font-extrabold tabular-nums',
                    player.rank === 1 && 'text-accent',
                    player.rank === 2 && 'text-foreground/90',
                    player.rank === 3 && 'text-orange-400/90',
                    player.rank > 3 && 'text-muted-foreground',
                  )}
                >
                  {player.rank}
                </span>
                <RankDeltaMini delta={player.rankDelta} />
              </div>
              <div className="flex min-w-0 items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={player.avatar}
                  alt=""
                  className={cn(
                    'size-6 shrink-0 rounded-md object-cover ring-1 ring-border',
                    player.rank <= 3 && 'ring-accent/30',
                  )}
                />
                <span className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-[11px] font-semibold">
                    {playerPublicName(player)}
                  </span>
                  {HERO_STREAKS[player.id] !== undefined && (
                    <StreakBadge
                      streak={streak}
                      className="origin-left scale-[0.52] shrink-0"
                    />
                  )}
                </span>
              </div>
              <span
                className={cn(
                  'text-center font-display text-[11px] font-bold tabular-nums',
                  streak > 0 && 'text-accent',
                  streak < 0 && 'text-destructive',
                  streak === 0 && 'text-muted-foreground/70',
                )}
              >
                {formatStreakValue(streak)}
              </span>
              <span className="text-right font-display text-[11px] font-bold tabular-nums text-primary">
                {formatSkill(playerSkill(player))}
              </span>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LandingNav() {
  return (
    <header className="relative z-20 border-b border-border/50 bg-background/60 backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-6xl items-center px-5 py-4 sm:px-8">
        <Link
          href={routes.landing}
          aria-label="PierdePaga"
          className="relative z-10 flex shrink-0 items-center"
        >
          <BrandLogo size="md" />
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          <a
            href="#modos"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Modos
          </a>
          <a
            href="#como-funciona"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Cómo funciona
          </a>
          <a
            href="#premios"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Premios
          </a>
        </nav>
        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2">
          <Link
            href={routes.login}
            className="hidden rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex"
          >
            Iniciar sesión
          </Link>
          <Link href={routes.home}>
            <PrimaryButton className="px-4 py-2.5 text-xs sm:px-5">
              Empezar gratis
              <ArrowRight className="size-3.5" />
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </header>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  tone,
  index,
}: {
  icon: typeof Trophy
  title: string
  description: string
  tone: 'primary' | 'accent'
  index: number
}) {
  const isAccent = tone === 'accent'

  return (
    <motion.article
      {...fadeUp(index)}
      className={cn(
        'group relative overflow-hidden rounded-3xl border p-6 sm:p-8',
        isAccent
          ? 'border-accent/25 bg-accent/[0.04] hover:border-accent/40'
          : 'border-border bg-card/50 hover:border-primary/30',
      )}
    >
      {isAccent && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      )}
      <div
        className={cn(
          'mb-5 grid size-12 place-items-center rounded-2xl border',
          isAccent
            ? 'border-accent/30 bg-accent/10 text-accent'
            : 'border-primary/30 bg-primary/10 text-primary',
        )}
      >
        <Icon className="size-5" strokeWidth={2} />
      </div>
      <h3 className="font-display text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </motion.article>
  )
}

function LiveBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary',
        className,
      )}
    >
      <span className="size-1.5 animate-pulse rounded-full bg-primary" />
      En vivo
    </span>
  )
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Atmosphere />

      <LandingNav />

      {/* Hero */}
      <section className="relative z-10 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/arena-hero.png"
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />

          {/* Marcador en vivo sobre la imagen */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute bottom-8 right-5 z-10 hidden max-w-xs rounded-2xl border border-primary/30 bg-background/85 p-4 shadow-[0_0_40px_oklch(0.78_0.14_195/0.15)] backdrop-blur-md sm:block lg:right-[12%] lg:bottom-12"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="type-label text-[9px]">Marcador en directo</p>
              <LiveBadge />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Sofi & Diego
              <span className="mx-1.5 text-muted-foreground/50">vs</span>
              Vale & Lu
            </p>
            <p className="mt-2 font-display text-2xl font-black tabular-nums text-primary text-glow-energy">
              6-4 · 3-2
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Club Padel Formosa · Pierde paga $10.000
            </p>
          </motion.div>
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <motion.div {...fadeUp(0)}>
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="type-badge inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                <Gift className="size-3.5" />
                100% gratis
              </span>
              <span className="type-badge inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                <Trophy className="size-3.5" />
                Ranking
              </span>
            </div>
            <h1 className="max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              El que pierde,
              <br />
              <span className="text-primary text-glow-energy">paga.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Competí en tu provincia, cargá partidos reales en canchas físicas
              y subí en el ranking. Desafiá rivales en pierde paga o sumá
              historial con partidos simples — todo gratis, con premios para
              los mejores.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={routes.home}>
                <PrimaryButton>
                  Empezar gratis
                  <Zap className="size-4" />
                </PrimaryButton>
              </Link>
              <a href="#modos">
                <AccentButton>
                  Ver modos de juego
                  <ChevronRight className="size-4" />
                </AccentButton>
              </a>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(1)}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <HeroRankingPreview />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-border/50 bg-card/30">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px bg-border/40 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              {...fadeUp(i)}
              className="bg-background/80 px-6 py-8 text-center sm:py-10"
            >
              <p className="font-display text-3xl font-black tabular-nums text-primary text-glow-energy sm:text-4xl">
                {stat.value}
              </p>
              <p className="type-label mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="modos" className="relative z-10 scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp(0)} className="max-w-2xl">
            <p className="type-kicker">Modos de juego</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tres formas de competir
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Pierde paga highlight */}
      <section className="relative z-10 px-5 py-20 sm:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-accent/25 bg-accent/[0.04]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <motion.div {...fadeUp(0)}>
              <p className="type-kicker text-accent">Desafío pierde paga</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Presión real.
                <br />
                <span className="text-accent text-glow-gold">Dinero en juego.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Proponé un desafío, confirmá con tu equipo y jugalo en la
                cancha. Si perdés, pagás. Si ganás, te llevás el respeto y el
                bolsillo del otro.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Filtro de rival ±200 pts de habilidad',
                  'Flujo de confirmación antes de jugar',
                  'Apuestas visibles en el feed de partidos',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Shield className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              {...fadeUp(1)}
              className="rounded-2xl border border-accent/20 bg-card/60 p-6"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <p className="type-label text-[9px] text-accent">Pierde paga</p>
                  <p className="mt-1 font-display text-lg font-bold">
                    Desafío pendiente
                  </p>
                </div>
                <span className="font-display text-xl font-black text-accent text-glow-gold">
                  $12.000
                </span>
              </div>
              <div className="mt-5 space-y-3 rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Propuesta enviada</span>
                  <span className="text-muted-foreground">Mañana · 18:30</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="font-semibold text-accent">A confirmar</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Club</span>
                  <span className="font-medium">Arena Norte</span>
                </div>
              </div>
              <p className="mt-5 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-center text-xs text-accent">
                Proponé, confirmá y jugá. Que pierda el que pueda pagar.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="relative z-10 scroll-mt-24 border-t border-border/50 px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp(0)} className="text-center">
            <p className="type-kicker">Cómo funciona</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              De cero a leyenda en 4 pasos
            </h2>
          </motion.div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                {...fadeUp(i + 1)}
                className="rounded-2xl border border-border bg-card/40 p-5"
              >
                <span className="font-display text-2xl font-black text-primary/30">
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premios */}
      <section id="premios" className="relative z-10 scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-card/40 p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <motion.div {...fadeUp(0)}>
              <p className="type-kicker">Premios</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Gratis para jugar. Premios para ganar.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                No pagás para competir. Los premios llegan por racha de
                victorias, podio provincial y recompensas de sponsors. Subí en
                el ranking y llevate algo concreto.
              </p>
            </motion.div>
            <motion.div
              {...fadeUp(1)}
              className="flex flex-wrap justify-center gap-3 lg:justify-end"
            >
              {[Crown, Medal, Flame].map((Icon, i) => (
                <div
                  key={i}
                  className={cn(
                    'grid size-16 place-items-center rounded-2xl border',
                    i === 0
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-primary/30 bg-primary/10 text-primary',
                  )}
                >
                  <Icon className="size-6" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 px-5 pb-24 pt-8 sm:px-8">
        <motion.div
          {...fadeUp(0)}
          className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-primary/30 bg-primary/5 px-8 py-14 text-center sm:py-16"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            La cancha te espera.
            <br />
            <span className="text-primary text-glow-energy">
              ¿Vas a pagar o vas a cobrar?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Creá tu cuenta gratis, cargá tu primer partido y empezá a escalar
            el ranking de tu provincia hoy.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={routes.home}>
              <PrimaryButton>
                Empezar gratis
                <ArrowRight className="size-4" />
              </PrimaryButton>
            </Link>
            <Link href={routes.login}>
              <AccentButton>Crear cuenta</AccentButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandLogo size="sm" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PierdePaga · El que pierde, paga.
          </p>
        </div>
      </footer>
    </div>
  )
}
