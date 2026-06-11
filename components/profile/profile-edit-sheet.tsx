'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { COUNTRIES, provincesFor } from '@/lib/regions'
import type { PlayerProfileData } from '@/lib/data'
import { GhostButton, PrimaryButton } from '@/components/ui-kit'
import { cn } from '@/lib/utils'

type ProfileEditSheetProps = {
  open: boolean
  profile: PlayerProfileData
  country: string
  province: string
  onClose: () => void
  onSave: (data: {
    profile: PlayerProfileData
    country: string
    province: string
  }) => string | null
}

const inputClass =
  'w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/25'

const labelClass = 'type-label mb-1.5 block text-[11px]'

export function ProfileEditSheet({
  open,
  profile,
  country,
  province,
  onClose,
  onSave,
}: ProfileEditSheetProps) {
  const [draft, setDraft] = useState(profile)
  const [draftCountry, setDraftCountry] = useState(country)
  const [draftProvince, setDraftProvince] = useState(province)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setDraft(profile)
    setDraftCountry(country)
    setDraftProvince(province)
    setError(null)
  }, [open, profile, country, province])

  if (!open) return null

  function handleCountryChange(next: string) {
    setDraftCountry(next)
    const provinces = provincesFor(next as 'ar' | 'py')
    setDraftProvince(provinces[0])
  }

  function handlePhotoChange(file: File | undefined) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setDraft((prev) => ({ ...prev, avatar: url }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = onSave({
      profile: {
        ...draft,
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        displayName: draft.displayName.trim(),
        instagram: draft.instagram?.trim() || undefined,
        dni: draft.dni.trim(),
      },
      country: draftCountry,
      province: draftProvince,
    })
    if (err) {
      setError(err)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="type-kicker">Perfil</p>
            <h2 className="text-xl font-semibold">Editar datos</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.avatar || '/placeholder.svg'}
              alt=""
              className="size-20 rounded-2xl object-cover ring-2 ring-primary/50"
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
            onChange={(e) => handlePhotoChange(e.target.files?.[0])}
          />
          <p className="text-sm text-muted-foreground">
            Tocá la foto para cambiarla. JPG o PNG.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="firstName">
              Nombre
            </label>
            <input
              id="firstName"
              required
              className={inputClass}
              value={draft.firstName}
              onChange={(e) =>
                setDraft((p) => ({ ...p, firstName: e.target.value }))
              }
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="lastName">
              Apellido
            </label>
            <input
              id="lastName"
              required
              className={inputClass}
              value={draft.lastName}
              onChange={(e) =>
                setDraft((p) => ({ ...p, lastName: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="displayName">
            Nombre para mostrar
          </label>
          <input
            id="displayName"
            required
            className={inputClass}
            value={draft.displayName}
            onChange={(e) =>
              setDraft((p) => ({ ...p, displayName: e.target.value }))
            }
            placeholder="Cómo te ven en el ranking y los desafíos"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Otros jugadores también pueden encontrarte por nombre, apellido o
            este alias al buscarte.
          </p>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="dni">
            DNI <span className="text-destructive">*</span>
          </label>
          <input
            id="dni"
            required
            inputMode="numeric"
            pattern="[0-9]{7,8}"
            className={inputClass}
            value={draft.dni}
            onChange={(e) =>
              setDraft((p) => ({ ...p, dni: e.target.value.replace(/\D/g, '') }))
            }
            placeholder="Sin puntos ni espacios"
          />
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="instagram">
            Instagram <span className="text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="instagram"
            className={inputClass}
            value={draft.instagram ?? ''}
            onChange={(e) =>
              setDraft((p) => ({ ...p, instagram: e.target.value }))
            }
            placeholder="@usuario"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="country">
              País
            </label>
            <select
              id="country"
              className={cn(inputClass, 'cursor-pointer')}
              value={draftCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="province">
              Provincia o ciudad
            </label>
            <select
              id="province"
              className={cn(inputClass, 'cursor-pointer')}
              value={draftProvince}
              onChange={(e) => setDraftProvince(e.target.value)}
            >
              {provincesFor(draftCountry as 'ar' | 'py').map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <GhostButton type="button" className="flex-1" onClick={onClose}>
            Cancelar
          </GhostButton>
          <PrimaryButton type="submit" className="flex-1">
            Guardar cambios
          </PrimaryButton>
        </div>
      </form>
    </div>
  )
}
