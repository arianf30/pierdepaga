'use client'

import { motion } from 'framer-motion'
import { Building2, Handshake, Trophy, Lock, ArrowRight, Bell } from 'lucide-react'
import { fadeUp } from '@/components/ui-kit'

const expansions = [
  {
    id: 'clubs',
    tag: 'Expansión I',
    title: 'Ecosistema de clubs',
    desc: 'Formá tu crew, reclamá una cancha y peleá contra clubs rivales por territorio y gloria de temporada. Rankings compartidos, guerras de club y arenas exclusivas.',
    image: '/clubs-teaser.png',
    icon: Building2,
    eta: 'Temporada 5',
    accent: 'primary',
  },
  {
    id: 'sponsors',
    tag: 'Expansión II',
    title: 'Ecosistema de sponsors',
    desc: 'Atraé sponsors a medida que subís. Desbloqueá contratos, apuestas bonus y equipamiento firmado. Cuanto mejor rendís, más grandes son las marcas detrás tuyo.',
    image: '/sponsors-teaser.png',
    icon: Handshake,
    eta: 'Temporada 5',
    accent: 'gold',
  },
  {
    id: 'tournaments',
    tag: 'Expansión III',
    title: 'Torneos avanzados',
    desc: 'Copas con llaves, espectadores en vivo y circuitos de campeonato con premios enormes. Ganate tu lugar entre las leyendas de PierdePaga.',
    image: '/tournament-teaser.png',
    icon: Trophy,
    eta: 'Temporada 6',
    accent: 'gold',
  },
]

export function ComingSoonView() {
  return (
    <div className="space-y-8 pb-10">
      <motion.div {...fadeUp(0)} className="text-center">
        <p className="type-kicker">Lo que viene</p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight lg:text-5xl">
          Próximas{' '}
          <span className="text-accent text-glow-gold">expansiones</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          PierdePaga recién empieza. Se están forjando nuevos mundos de
          competencia. Preparate para lo que sigue.
        </p>
      </motion.div>

      <div className="space-y-6">
        {expansions.map((x, i) => {
          const isGold = x.accent === 'gold'
          return (
            <motion.section
              key={x.id}
              {...fadeUp(i + 1)}
              className="group relative overflow-hidden rounded-3xl border border-border"
            >
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={x.image || '/placeholder.svg'}
                  alt={x.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    i % 2 === 0
                      ? 'from-background via-background/85 to-background/30'
                      : 'from-background/30 via-background/85 to-background lg:bg-gradient-to-l'
                  }`}
                />
              </div>

              <div
                className={`relative flex min-h-[300px] flex-col justify-center gap-4 p-7 sm:p-10 lg:max-w-xl ${
                  i % 2 !== 0 ? 'lg:ml-auto lg:items-end lg:text-right' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-11 place-items-center rounded-xl border ${
                      isGold
                        ? 'border-accent/40 bg-accent/10 text-accent ring-glow-gold'
                        : 'border-primary/40 bg-primary/10 text-primary ring-glow-energy'
                    }`}
                  >
                    <x.icon className="size-5" />
                  </span>
                  <span
                    className={`type-badge rounded-full border px-3 py-1 ${
                      isGold
                        ? 'border-accent/40 text-accent'
                        : 'border-primary/40 text-primary'
                    }`}
                  >
                    {x.tag}
                  </span>
                </div>

                <h2 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
                  {x.title}
                </h2>
                <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                  {x.desc}
                </p>

                <div
                  className={`mt-1 flex flex-wrap items-center gap-3 ${
                    i % 2 !== 0 ? 'lg:justify-end' : ''
                  }`}
                >
                  <span className="type-badge inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
                    <Lock className="size-3.5" /> Se desbloquea {x.eta}
                  </span>
                  <button
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold transition-transform hover:scale-105 ${
                      isGold
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <Bell className="size-3.5" /> Avisame
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </motion.section>
          )
        })}
      </div>

      <motion.div
        {...fadeUp(4)}
        className="rounded-3xl border border-border glass p-8 text-center"
      >
        <p className="font-display text-lg font-bold">Más roles en camino</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          El rol Jugador está activo hoy. Sponsor y Club van a transformar el
          panorama competitivo. La arena sigue creciendo.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <span className="type-badge rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs text-primary">
            Jugador · Activo
          </span>
          <span className="type-badge rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
            Sponsor · Pronto
          </span>
          <span className="type-badge rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
            Club · Pronto
          </span>
        </div>
      </motion.div>
    </div>
  )
}
