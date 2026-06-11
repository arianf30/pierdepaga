'use client'

import { useState } from 'react'
import { Check, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import type { PendingPartido, PlayerLite } from '@/lib/supabase/partidos'
import { PrimaryButton } from '@/components/ui-kit'
import { cn } from '@/lib/utils'

function PlayerChip({
  player,
  confirmed,
  isLoader,
}: {
  player: PlayerLite
  confirmed: boolean
  isLoader?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={player.avatar || '/placeholder-user.jpg'}
        alt=""
        className="size-7 shrink-0 rounded-lg object-cover ring-1 ring-border"
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {player.name}
      </span>
      {isLoader ? (
        <span className="type-badge shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[8px] text-muted-foreground">
          Cargó
        </span>
      ) : confirmed ? (
        <Check className="size-3.5 shrink-0 text-primary" />
      ) : (
        <Clock className="size-3.5 shrink-0 text-muted-foreground/60" />
      )}
    </div>
  )
}

export function PendingPartidoCard({
  partido,
  onConfirm,
}: {
  partido: PendingPartido
  onConfirm: (id: string) => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmsCount =
    (partido.confirms.j2a ? 1 : 0) +
    (partido.confirms.j1b ? 1 : 0) +
    (partido.confirms.j2b ? 1 : 0)

  const fecha = new Date(partido.fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  })

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(partido.id)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo confirmar el partido',
      )
      setSubmitting(false)
    }
  }

  // confirms.* mapea a teamA[1] (j2a) y teamB[0] (j1b), teamB[1] (j2b)
  const teamAConfirms = [true, partido.confirms.j2a]
  const teamBConfirms = [partido.confirms.j1b, partido.confirms.j2b]

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{fecha}</span>
          {partido.club && <span>· {partido.club}</span>}
        </div>
        <span className="type-badge rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-500">
          Pendiente · {confirmsCount}/2
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div
          className={cn(
            'space-y-2 rounded-xl border p-2.5',
            partido.ganador === 'A'
              ? 'border-primary/30 bg-primary/5'
              : 'border-border bg-card/40',
          )}
        >
          <p className="type-label text-[9px] text-primary">
            Equipo A {partido.ganador === 'A' && '· ganó'}
          </p>
          {partido.teamA.map((p, i) => (
            <PlayerChip
              key={p.id || i}
              player={p}
              confirmed={teamAConfirms[i]}
              isLoader={i === 0}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="font-display text-sm font-bold tabular-nums text-foreground">
            {partido.resultado}
          </p>
          <p className="type-label mt-1 text-[8px]">vs</p>
        </div>

        <div
          className={cn(
            'space-y-2 rounded-xl border p-2.5',
            partido.ganador === 'B'
              ? 'border-accent/30 bg-accent/5'
              : 'border-border bg-card/40',
          )}
        >
          <p className="type-label text-[9px]">
            Equipo B {partido.ganador === 'B' && '· ganó'}
          </p>
          {partido.teamB.map((p, i) => (
            <PlayerChip key={p.id || i} player={p} confirmed={teamBConfirms[i]} />
          ))}
        </div>
      </div>

      {partido.puntos_ganados != null && (
        <p className="text-center text-[11px] text-muted-foreground">
          En juego:{' '}
          <span className="font-semibold text-foreground tabular-nums">
            {partido.puntos_ganados}
          </span>{' '}
          puntos por jugador
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {partido.me.canConfirm ? (
        <PrimaryButton
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Confirmando…
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Confirmar partido
            </>
          )}
        </PrimaryButton>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 text-xs text-primary">
          <Check className="size-3.5" />
          {partido.me.slot === 'loader'
            ? 'Cargaste este partido. Esperando confirmaciones.'
            : 'Ya confirmaste. Esperando al resto.'}
        </div>
      )}
    </div>
  )
}
