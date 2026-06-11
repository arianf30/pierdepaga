'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Gift, Loader2, X } from 'lucide-react'
import type { SponsorPrizeSubmission } from '@/lib/types/account'
import { prizeScopeLabel } from '@/lib/prizes/scope-label'
import { GhostButton, PrimaryButton } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { formatStreakValue } from '@/lib/streaks'

function targetLabel(item: SponsorPrizeSubmission): string {
  if (item.prize_type === 'ranking' && item.ranking_position) {
    return `Puesto #${item.ranking_position}`
  }
  if (item.prize_type === 'streak' && item.streak_milestone) {
    return `Racha ${formatStreakValue(item.streak_milestone)}`
  }
  return 'Premio'
}

function ModerationCard({
  item,
  busy,
  onDecision,
}: {
  item: SponsorPrizeSubmission
  busy: boolean
  onDecision: (status: 'approved' | 'rejected') => void
}) {
  return (
    <article className="rounded-2xl border border-border bg-card/50 p-4">
      <div className="flex gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Gift className="size-5 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.sponsor_brand} · {targetLabel(item)} ·{' '}
            {item.quantity_available} u.
          </p>
          <p className="mt-1 text-xs text-accent">
            {prizeScopeLabel(item.country_id, item.province, item.sport_id)}
          </p>
          {item.detail && (
            <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <PrimaryButton
          type="button"
          disabled={busy}
          className="flex-1 bg-primary text-primary-foreground"
          onClick={() => onDecision('approved')}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Check className="size-4" />
              Aprobar
            </>
          )}
        </PrimaryButton>
        <GhostButton
          type="button"
          disabled={busy}
          className={cn(
            'flex-1 border-destructive/30 text-destructive hover:bg-destructive/10',
          )}
          onClick={() => onDecision('rejected')}
        >
          <X className="size-4" />
          Rechazar
        </GhostButton>
      </div>
    </article>
  )
}

export function PrizeModerationPanel() {
  const [items, setItems] = useState<SponsorPrizeSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPending = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/prizes?moderation=1', {
        credentials: 'include',
        cache: 'no-store',
      })
      const body = (await response.json()) as {
        submissions?: SponsorPrizeSubmission[]
        error?: string
      }
      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudo cargar la moderación')
      }
      setItems(body.submissions ?? [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar la moderación',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPending()
  }, [loadPending])

  async function handleDecision(
    id: string,
    status: 'approved' | 'rejected',
  ) {
    setBusyId(id)
    setError(null)
    try {
      const response = await fetch(`/api/prizes/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const body = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(body.error ?? 'No se pudo actualizar el estado')
      }
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar el estado',
      )
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando pendientes…</p>
  }

  return (
    <div className="space-y-3">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {items.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground">
          No hay postulaciones pendientes de revisión.
        </p>
      ) : (
        items.map((item) => (
          <ModerationCard
            key={item.id}
            item={item}
            busy={busyId === item.id}
            onDecision={(status) => void handleDecision(item.id, status)}
          />
        ))
      )}
    </div>
  )
}
