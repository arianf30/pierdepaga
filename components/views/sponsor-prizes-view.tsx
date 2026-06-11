'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Package, Send, ShieldCheck, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadPrizeImage } from '@/lib/supabase/profiles'
import type {
  SponsorPrizeSubmission,
  SponsorPrizeTarget,
} from '@/lib/types/account'
import { useUser } from '@/components/auth/user-provider'
import {
  AnnualPrizeCard,
  EmptyAnnualSlotCard,
  EmptyStreakSlotCard,
  StreakPrizeCard,
} from '@/components/prizes/prize-catalog-cards'
import { PrizeModerationPanel } from '@/components/prizes/prize-moderation-panel'
import { SponsorPrizeSubmitModal } from '@/components/prizes/sponsor-prize-submit-modal'
import { prizeScopeLabel } from '@/lib/prizes/scope-label'
import {
  mapSubmissionToAnnualPrize,
  mapSubmissionToStreakPrize,
} from '@/lib/prizes/map-submission'
import {
  pickRankingCatalogPrize,
  pickStreakCatalogPrize,
} from '@/lib/prizes/pick-catalog-prize'
import { useScopePrizes } from '@/hooks/use-scope-prizes'
import { SectionTitle, fadeUp, GhostButton } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { formatStreakValue, POSITIVE_STREAK_MILESTONES } from '@/lib/streaks'

type SponsorTab = 'catalogo' | 'activos' | 'entregados' | 'moderacion'

function postularButton(onClick: () => void) {
  return (
    <GhostButton
      type="button"
      onClick={onClick}
      className="w-full border-accent/30 text-accent hover:border-accent/50 hover:bg-accent/10"
    >
      <Send className="size-3.5" />
      Postular premio
    </GhostButton>
  )
}

function submissionTargetLabel(item: SponsorPrizeSubmission): string {
  if (item.prize_type === 'ranking' && item.ranking_position) {
    return `Puesto #${item.ranking_position}`
  }
  if (item.prize_type === 'streak' && item.streak_milestone) {
    return `Racha ${formatStreakValue(item.streak_milestone)}`
  }
  return 'Premio'
}

function statusBadge(status: SponsorPrizeSubmission['status']) {
  const labels = {
    pending: 'Pendiente',
    approved: 'Activo',
    rejected: 'Rechazado',
    delivered: 'Entregado',
  } as const

  return (
    <span
      className={cn(
        'type-badge rounded-full px-2.5 py-1',
        status === 'approved' &&
          'border-primary/30 bg-primary/10 text-primary',
        status === 'pending' &&
          'border-accent/30 bg-accent/10 text-accent',
        status === 'rejected' &&
          'border-destructive/30 bg-destructive/10 text-destructive',
        status === 'delivered' &&
          'border-muted-foreground/30 bg-secondary text-muted-foreground',
      )}
    >
      {labels[status]}
    </span>
  )
}

function SubmissionCard({ item }: { item: SponsorPrizeSubmission }) {
  const remaining = Math.max(0, item.quantity_available - item.delivered_count)

  return (
    <article className="flex gap-4 rounded-2xl border border-border bg-card/50 p-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gift className="size-6 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.sponsor_brand} · {submissionTargetLabel(item)}
            </p>
            <p className="mt-1 text-xs text-accent">
              {prizeScopeLabel(item.country_id, item.province, item.sport_id)}
            </p>
          </div>
          {statusBadge(item.status)}
        </div>
        {item.detail && (
          <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
        )}
        <p className="mt-2 text-xs tabular-nums text-muted-foreground">
          {item.delivered_count} entregados · {remaining} disponibles de{' '}
          {item.quantity_available}
        </p>
      </div>
    </article>
  )
}

export function SponsorPrizesView() {
  const { user, player, profile, isAdmin } = useUser()
  const {
    catalog,
    submissions,
    loading,
    error: loadError,
    refresh,
    country,
    province,
    sport,
  } = useScopePrizes(true)
  const [tab, setTab] = useState<SponsorTab>('catalogo')
  const [target, setTarget] = useState<SponsorPrizeTarget | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scopeLabel = prizeScopeLabel(country, province, sport)

  const defaultBrand =
    profile.displayName.trim() ||
    `${profile.firstName} ${profile.lastName}`.trim()

  const activePrizes = useMemo(
    () =>
      submissions.filter(
        (item) =>
          (item.status === 'pending' || item.status === 'approved') &&
          item.delivered_count < item.quantity_available,
      ),
    [submissions],
  )

  const deliveredPrizes = useMemo(
    () =>
      submissions.filter(
        (item) => item.status === 'delivered' || item.delivered_count > 0,
      ),
    [submissions],
  )

  function openPostular(next: SponsorPrizeTarget) {
    setError(null)
    setTarget(next)
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
    setTarget(null)
    setError(null)
  }

  async function handleSubmit(input: {
    title: string
    detail: string
    brand: string
    quantity: number
    imageFile: File | null
  }) {
    if (!user || !target) return

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      let imageUrl: string | null = null
      if (input.imageFile) {
        imageUrl = await uploadPrizeImage(supabase, user.id, input.imageFile)
      }

      const response = await fetch('/api/prizes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_id: country,
          province,
          sport_id: sport,
          title: input.title,
          detail: input.detail,
          sponsor_brand: input.brand,
          image_url: imageUrl,
          prize_type: target.prizeType,
          ranking_position:
            target.prizeType === 'ranking' ? target.rankingPosition : null,
          streak_milestone:
            target.prizeType === 'streak' ? target.streakMilestone : null,
          quantity_available: input.quantity,
        }),
      })

      const body = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudo enviar la postulación.')
      }

      closeModal()
      await refresh()
      setTab('activos')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar la postulación.',
      )
    } finally {
      setSaving(false)
    }
  }

  const podiumOrder: (1 | 2 | 3)[] = [2, 1, 3]
  const tabs: { id: SponsorTab; label: string; icon: typeof Gift }[] = [
    { id: 'catalogo', label: 'Catálogo', icon: Trophy },
    { id: 'activos', label: 'Premios activos', icon: Package },
    { id: 'entregados', label: 'Entregados', icon: Gift },
    ...(isAdmin
      ? [{ id: 'moderacion' as const, label: 'Moderación', icon: ShieldCheck }]
      : []),
  ]

  return (
    <div className="space-y-8 pb-10">
      <motion.div {...fadeUp(0)}>
        <span className="type-badge mb-3 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-accent">
          <Gift className="size-3.5" />
          Panel sponsor
        </span>
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
          Premios
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Hola {player.displayName ?? player.name}. Revisá el catálogo y postulá
          premios para el scope seleccionado arriba.
        </p>
        <p className="mt-2 inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {scopeLabel}
        </p>
      </motion.div>

      <motion.div
        {...fadeUp(1)}
        className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card/40 p-1.5"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none',
              tab === item.id
                ? 'bg-accent/15 text-accent'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </motion.div>

      {tab === 'catalogo' && (
        <>
          <motion.section {...fadeUp(2)}>
            <SectionTitle kicker="Anual" title="Top 3 regional" />
            <p className="-mt-2 mb-4 text-xs text-muted-foreground">
              Postulá un premio para cada puesto del podio en {scopeLabel}.
            </p>
            <div className="grid items-end gap-4 sm:grid-cols-3">
              {podiumOrder.map((position) => {
                const catalogPrize = pickRankingCatalogPrize(catalog, position)
                const action = postularButton(() =>
                  openPostular({
                    prizeType: 'ranking',
                    rankingPosition: position,
                  }),
                )

                if (catalogPrize) {
                  return (
                    <AnnualPrizeCard
                      key={`ranking-${position}`}
                      prize={mapSubmissionToAnnualPrize(catalogPrize)}
                      action={action}
                    />
                  )
                }

                return (
                  <EmptyAnnualSlotCard
                    key={`ranking-${position}`}
                    position={position}
                    action={action}
                  />
                )
              })}
            </div>
          </motion.section>

          <motion.section {...fadeUp(3)}>
            <SectionTitle kicker="Rachas" title="Premios por racha positiva" />
            <p className="-mt-2 mb-4 text-xs text-muted-foreground">
              Elegí un hito de racha y proponé tu premio para {scopeLabel}.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {POSITIVE_STREAK_MILESTONES.map((milestone, i) => {
                const catalogPrize = pickStreakCatalogPrize(catalog, milestone)
                const action = postularButton(() =>
                  openPostular({
                    prizeType: 'streak',
                    streakMilestone: milestone,
                  }),
                )

                if (catalogPrize) {
                  return (
                    <StreakPrizeCard
                      key={`streak-${milestone}`}
                      prize={mapSubmissionToStreakPrize(catalogPrize)}
                      index={i}
                      action={action}
                    />
                  )
                }

                return (
                  <EmptyStreakSlotCard
                    key={`streak-${milestone}`}
                    milestone={milestone}
                    index={i}
                    action={action}
                  />
                )
              })}
            </div>
          </motion.section>
        </>
      )}

      {tab === 'activos' && (
        <motion.section {...fadeUp(2)} className="space-y-3">
          <SectionTitle kicker="Tus premios" title="Premios activos" />
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : activePrizes.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground">
              No tenés premios activos en {scopeLabel}. Andá al catálogo y
              postulá uno.
            </p>
          ) : (
            activePrizes.map((item) => (
              <SubmissionCard key={item.id} item={item} />
            ))
          )}
        </motion.section>
      )}

      {tab === 'entregados' && (
        <motion.section {...fadeUp(2)} className="space-y-3">
          <SectionTitle kicker="Historial" title="Entregados" />
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : deliveredPrizes.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground">
              Aún no hay premios entregados en {scopeLabel}.
            </p>
          ) : (
            deliveredPrizes.map((item) => (
              <SubmissionCard key={item.id} item={item} />
            ))
          )}
        </motion.section>
      )}

      {tab === 'moderacion' && isAdmin && (
        <motion.section {...fadeUp(2)} className="space-y-3">
          <SectionTitle kicker="Admin" title="Postulaciones pendientes" />
          <PrizeModerationPanel />
        </motion.section>
      )}

      {loadError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {loadError}
        </p>
      )}

      <SponsorPrizeSubmitModal
        open={modalOpen}
        target={target}
        scopeLabel={scopeLabel}
        defaultBrand={defaultBrand}
        saving={saving}
        error={error}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
