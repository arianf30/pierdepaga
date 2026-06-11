'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Plus, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  createSponsorSubmission,
  fetchSponsorSubmissions,
} from '@/lib/supabase/profiles'
import type { SponsorPrizeSubmission } from '@/lib/types/account'
import { useUser } from '@/components/auth/user-provider'
import { fadeUp, PrimaryButton } from '@/components/ui-kit'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50 focus:ring-1 focus:ring-accent/25'

export function SponsorPrizesView() {
  const { user, player } = useUser()
  const [submissions, setSubmissions] = useState<SponsorPrizeSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [brand, setBrand] = useState('')

  async function loadSubmissions() {
    if (!user) return
    setLoading(true)
    try {
      const supabase = createClient()
      const rows = await fetchSponsorSubmissions(supabase, user.id)
      setSubmissions(rows)
    } catch {
      setError('No se pudieron cargar tus postulaciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || !brand.trim()) {
      setError('Completá el nombre del premio y tu marca.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      await createSponsorSubmission(supabase, user.id, {
        title: title.trim(),
        detail: detail.trim(),
        sponsor_brand: brand.trim(),
      })
      setTitle('')
      setDetail('')
      setBrand('')
      await loadSubmissions()
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

  return (
    <div className="space-y-8 pb-10">
      <motion.div {...fadeUp(0)}>
        <span className="type-badge mb-3 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-accent">
          <Gift className="size-3.5" />
          Panel sponsor
        </span>
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
          Postulá tus premios
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Hola {player.displayName ?? player.name}. Acá podés proponer premios
          para jugadores de PierdePaga. El equipo los revisa y, si aprueban, los
          publica en el catálogo.
        </p>
      </motion.div>

      <motion.form
        {...fadeUp(1)}
        onSubmit={handleSubmit}
        className="rounded-3xl border border-accent/25 bg-accent/[0.04] p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <Plus className="size-5" />
          </span>
          <div>
            <p className="type-kicker">Nueva postulación</p>
            <h2 className="text-lg font-semibold">Premio para la comunidad</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="type-label mb-1.5 block" htmlFor="prize-title">
              Nombre del premio
            </label>
            <input
              id="prize-title"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Paleta Pro Edition"
              required
            />
          </div>
          <div>
            <label className="type-label mb-1.5 block" htmlFor="prize-brand">
              Tu marca / sponsor
            </label>
            <input
              id="prize-brand"
              className={inputClass}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ej. SportZone"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="type-label mb-1.5 block" htmlFor="prize-detail">
              Detalle y condiciones
            </label>
            <textarea
              id="prize-detail"
              className={cn(inputClass, 'min-h-28 resize-y')}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Qué incluye, para qué ranking o racha aplica, stock estimado…"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <PrimaryButton
          type="submit"
          disabled={saving}
          className="mt-6 bg-accent text-accent-foreground hover:brightness-110"
        >
          <Send className="size-4" />
          {saving ? 'Enviando…' : 'Enviar postulación'}
        </PrimaryButton>
      </motion.form>

      <motion.section {...fadeUp(2)}>
        <h2 className="mb-4 text-lg font-semibold">Tus postulaciones</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : submissions.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground">
            Todavía no enviaste premios. Completá el formulario de arriba para
            empezar.
          </p>
        ) : (
          <div className="space-y-3">
            {submissions.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border bg-card/50 px-5 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.sponsor_brand}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'type-badge rounded-full px-2.5 py-1',
                      item.status === 'approved' &&
                        'border-primary/30 bg-primary/10 text-primary',
                      item.status === 'pending' &&
                        'border-accent/30 bg-accent/10 text-accent',
                      item.status === 'rejected' &&
                        'border-destructive/30 bg-destructive/10 text-destructive',
                    )}
                  >
                    {item.status === 'approved'
                      ? 'Aprobado'
                      : item.status === 'rejected'
                        ? 'Rechazado'
                        : 'Pendiente'}
                  </span>
                </div>
                {item.detail && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
