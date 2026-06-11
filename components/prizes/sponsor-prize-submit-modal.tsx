'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import type { SponsorPrizeTarget } from '@/lib/types/account'
import { GhostButton, PrimaryButton } from '@/components/ui-kit'
import { cn } from '@/lib/utils'
import { formatStreakValue } from '@/lib/streaks'

const inputClass =
  'w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50 focus:ring-1 focus:ring-accent/25'

const labelClass = 'type-label mb-1.5 block text-[11px]'

type SponsorPrizeSubmitModalProps = {
  open: boolean
  target: SponsorPrizeTarget | null
  scopeLabel?: string
  defaultBrand?: string
  saving: boolean
  error: string | null
  onClose: () => void
  onSubmit: (input: {
    title: string
    detail: string
    brand: string
    quantity: number
    imageFile: File | null
  }) => Promise<void>
}

function targetLabel(target: SponsorPrizeTarget): string {
  if (target.prizeType === 'ranking') {
    return `Puesto #${target.rankingPosition} — ranking regional`
  }
  return `Racha ${formatStreakValue(target.streakMilestone)}`
}

export function SponsorPrizeSubmitModal({
  open,
  target,
  scopeLabel,
  defaultBrand = '',
  saving,
  error,
  onClose,
  onSubmit,
}: SponsorPrizeSubmitModalProps) {
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [brand, setBrand] = useState(defaultBrand)
  const [quantity, setQuantity] = useState('1')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setDetail('')
    setBrand(defaultBrand)
    setQuantity('1')
    setImagePreview(null)
    setImageFile(null)
  }, [open, target, defaultBrand])

  if (!open || !target) return null

  function handleImageChange(file: File | undefined) {
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleClose() {
    if (saving) return
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = Number.parseInt(quantity, 10)
    if (!title.trim() || !brand.trim()) return
    if (!Number.isFinite(qty) || qty < 1) return

    await onSubmit({
      title: title.trim(),
      detail: detail.trim(),
      brand: brand.trim(),
      quantity: qty,
      imageFile,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
        disabled={saving}
      />
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="type-kicker">Postulación</p>
            <h2 className="text-xl font-semibold">Postular premio</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {targetLabel(target)}
            </p>
            {scopeLabel && (
              <p className="mt-1 text-xs font-medium text-primary">
                {scopeLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <fieldset disabled={saving} className="contents">
          <div className="mb-4">
            <label className={labelClass} htmlFor="prize-short-name">
              Nombre corto del premio
            </label>
            <input
              id="prize-short-name"
              required
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Paleta Pro Edition"
            />
          </div>

          <div className="mb-4">
            <label className={labelClass} htmlFor="prize-detail">
              Descripción
            </label>
            <textarea
              id="prize-detail"
              className={cn(inputClass, 'min-h-24 resize-y')}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Qué incluye el premio, condiciones de entrega…"
            />
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="prize-brand">
                Marca
              </label>
              <input
                id="prize-brand"
                required
                className={inputClass}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Tu marca o anunciante"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="prize-quantity">
                Cantidad disponible
              </label>
              <input
                id="prize-quantity"
                required
                type="number"
                min={1}
                inputMode="numeric"
                className={inputClass}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <p className={labelClass}>Imagen del premio</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview || '/placeholder.svg'}
                  alt=""
                  className="size-20 rounded-2xl object-cover ring-2 ring-accent/40"
                />
                <span className="absolute inset-0 grid place-items-center rounded-2xl bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-5 text-foreground" />
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />
              <p className="text-sm text-muted-foreground">
                Tocá para subir una imagen. JPG o PNG.
              </p>
            </div>
          </div>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <GhostButton
            type="button"
            className="flex-1"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </GhostButton>
          <PrimaryButton
            type="submit"
            className="flex-1 bg-accent text-accent-foreground hover:brightness-110"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              'Enviar postulación'
            )}
          </PrimaryButton>
        </div>
      </form>
    </div>
  )
}
