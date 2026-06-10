'use client'

import Link from 'next/link'
import { ArrowLeft, Archive } from 'lucide-react'
import { ProfilePerformanceMetricsArchive } from '@/components/archive/profile-performance-metrics'
import { ProfileAchievementsPanelArchive } from '@/components/archive/profile-achievements-panel'
import { HomeIncomingChallengesArchive } from '@/components/archive/home-incoming-challenges'
import { HomeRecentActivityArchive } from '@/components/archive/home-recent-activity'
import { RankingPodiumArchive } from '@/components/archive/ranking-podium'
import { StreakBadgeV1Archive } from '@/components/archive/streak-badge-v1'

const sections = [
  {
    id: 'performance',
    title: 'Métricas de rendimiento',
    source: 'Perfil del jugador',
    note: 'Barras de ataque, defensa, consistencia y presión. Sin datos reales de partidos.',
    component: <ProfilePerformanceMetricsArchive />,
  },
  {
    id: 'achievements',
    title: 'Logros y trofeos',
    source: 'Perfil del jugador',
    note: 'Sistema de logros desbloqueables (primer partido, rachas, etc.). Reemplazado por premios conseguidos.',
    component: <ProfileAchievementsPanelArchive />,
  },
  {
    id: 'home-challenges',
    title: 'Desafíos entrantes en Home',
    source: 'Home / Arena',
    note: 'Panel lateral de desafíos pendientes. Movido a Notificaciones.',
    component: <HomeIncomingChallengesArchive />,
  },
  {
    id: 'home-activity',
    title: 'Actividad reciente en Home',
    source: 'Home / Arena',
    note: 'Feed genérico de actividad. Reemplazado por resumen de ranking y partidos.',
    component: <HomeRecentActivityArchive />,
  },
  {
    id: 'ranking-podium',
    title: 'Podio top 3',
    source: 'Ranking',
    note: 'Tarjetas diferenciadas para puestos 1, 2 y 3. Reemplazado por tabla uniforme.',
    component: <RankingPodiumArchive />,
  },
  {
    id: 'streak-badge-v1',
    title: 'Badges de racha v1',
    source: 'Ranking / Arena',
    note: 'Íconos caliente/frío por tramos. Tamaño fijo, cambio de ícono y color. Versión anterior al estilo épico.',
    component: <StreakBadgeV1Archive />,
  },
] as const

export function ArchivePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a la app
        </Link>

        <div className="mb-10 flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl border border-border bg-card/60">
            <Archive className="size-5 text-primary" />
          </div>
          <div>
            <p className="type-kicker">Copia de seguridad</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Archivo de componentes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              UI y estilos que sacamos de las pantallas activas pero que
              queremos conservar para reutilizar más adelante.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <section
              key={section.id}
              className="rounded-3xl border border-border bg-card/30 p-6 sm:p-8"
            >
              <div className="mb-6 border-b border-border pb-4">
                <p className="type-label text-primary">{section.source}</p>
                <h2 className="mt-1 text-xl font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {section.note}
                </p>
              </div>
              {section.component}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
