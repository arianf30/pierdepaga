'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import {
  AVAILABLE_COUNTRIES,
  availableCountryById,
  availableProvincesFor,
  defaultProvinceFor,
  isCountryId,
} from '@/lib/catalog'
import type { PlayerProfileData } from '@/lib/data'
import { GhostButton, PrimaryButton } from '@/components/ui-kit'
import { SelectShell, selectValueClass } from '@/components/ui/select-shell'
import { cn } from '@/lib/utils'

type ProfileEditSheetProps = {
  open: boolean
  profile: PlayerProfileData
  country: string
  province: string
  mode?: 'jugador' | 'sponsor'
  onClose: () => void
  onSave: (data: {
    profile: PlayerProfileData
    country: string
    province: string
    avatarFile?: File | null
  }) => Promise<string | null> | string | null
}

const inputClass =
  'w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/25'

const labelClass = 'type-label mb-1.5 block text-[11px]'

const SAVE_TIMEOUT_MS = 26_000

export function ProfileEditSheet({
  open,
  profile,
  country,
  province,
  mode = 'jugador',
  onClose,
  onSave,
}: ProfileEditSheetProps) {
  const isSponsor = mode === 'sponsor'
  const [draft, setDraft] = useState(profile)
  const [draftCountry, setDraftCountry] = useState(country)
  const [draftProvince, setDraftProvince] = useState(province)
  const [error, setError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setSaving(false)
      setError(null)
    }
  }, [open])

  if (!open) return null

  const selectedCountry = isCountryId(draftCountry)
    ? availableCountryById(draftCountry)
    : availableCountryById(AVAILABLE_COUNTRIES[0].id)

  function handleCountryChange(next: string) {
    if (!isCountryId(next)) return
    setDraftCountry(next)
    setDraftProvince(defaultProvinceFor(next))
  }

  function handlePhotoChange(file: File | undefined) {
    if (!file) return
    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setDraft((prev) => ({ ...prev, avatar: url }))
  }

  function handleClose() {
    if (saving) return
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return

    setSaving(true)
    setError(null)

    try {
      const err = await Promise.race([
        onSave({
          profile: {
            ...draft,
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            displayName: draft.displayName.trim(),
            instagram: draft.instagram?.trim() || undefined,
            dni: isSponsor ? '' : draft.dni.trim(),
            address: draft.address?.trim() || undefined,
            phone: draft.phone?.trim() || undefined,
          },
          country: draftCountry,
          province: draftProvince,
          avatarFile,
        }),
        new Promise<string>((resolve) =>
          setTimeout(
            () =>
              resolve(
                'El guardado tardó demasiado. Revisá tu conexión e intentá de nuevo.',
              ),
            SAVE_TIMEOUT_MS,
          ),
        ),
      ])

      if (err) {
        setError(err)
        return
      }

      onClose()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'No se pudo guardar el perfil.',
      )
    } finally {
      setSaving(false)
    }
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
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="type-kicker">{isSponsor ? 'Anunciante' : 'Perfil'}</p>
            <h2 className="text-xl font-semibold">
              {isSponsor ? 'Datos del sponsor' : 'Editar datos'}
            </h2>
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

        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={saving}
            className="group relative shrink-0 disabled:opacity-60"
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
            disabled={saving}
            onChange={(e) => handlePhotoChange(e.target.files?.[0])}
          />
          <p className="text-sm text-muted-foreground">
            {isSponsor
              ? 'Tocá el logo para cambiarlo. JPG o PNG.'
              : 'Tocá la foto para cambiarla. JPG o PNG.'}
          </p>
        </div>

        <fieldset disabled={saving} className="contents">
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
              placeholder={
                isSponsor
                  ? 'Nombre visible de tu marca o anunciante'
                  : 'Cómo te ven en el ranking y los desafíos'
              }
            />
            {!isSponsor && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Otros jugadores también pueden encontrarte por nombre, apellido o
                este alias al buscarte.
              </p>
            )}
          </div>

          {!isSponsor && (
            <>
              <div className="mt-4">
                <label
                  className={`${labelClass} flex flex-wrap items-center gap-2`}
                  htmlFor="dni"
                >
                  <span>
                    DNI <span className="text-destructive">*</span>
                  </span>
                  <span className="font-normal normal-case text-muted-foreground">
                    · oculto para otros usuarios
                  </span>
                </label>
                <input
                  id="dni"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{7,8}"
                  className={inputClass}
                  value={draft.dni}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      dni: e.target.value.replace(/\D/g, ''),
                    }))
                  }
                  placeholder="Sin puntos ni espacios"
                />
              </div>

              <div className="mt-4">
                <label className={labelClass} htmlFor="instagram">
                  Instagram{' '}
                  <span className="text-muted-foreground">(opcional)</span>
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
            </>
          )}

          {isSponsor && (
            <>
              <div className="mt-4">
                <label className={labelClass} htmlFor="address">
                  Dirección
                </label>
                <input
                  id="address"
                  className={inputClass}
                  value={draft.address ?? ''}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Calle, número, localidad"
                />
              </div>
              <div className="mt-4">
                <label className={labelClass} htmlFor="phone">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={inputClass}
                  value={draft.phone ?? ''}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="Ej. 3704 123456"
                />
              </div>
            </>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <p className={labelClass}>País</p>
              <SelectShell
                label="País"
                className="w-full"
                value={draftCountry}
                onChange={handleCountryChange}
                options={AVAILABLE_COUNTRIES.map((item) => ({
                  value: item.id,
                  label: `${item.flag} ${item.name}`,
                }))}
              >
                <span className="shrink-0 text-lg leading-none">
                  {selectedCountry.flag}
                </span>
                <span className="min-w-0 truncate text-sm font-semibold">
                  {selectedCountry.name}
                </span>
              </SelectShell>
            </div>
            <div className="min-w-0">
              <p className={labelClass}>Provincia o ciudad</p>
              <SelectShell
                label="Provincia o ciudad"
                className="w-full"
                value={draftProvince}
                onChange={setDraftProvince}
                options={availableProvincesFor(
                  isCountryId(draftCountry)
                    ? draftCountry
                    : AVAILABLE_COUNTRIES[0].id,
                ).map((item) => ({
                  value: item,
                  label: item.toUpperCase(),
                }))}
              >
                <span className={cn(selectValueClass, 'min-w-0 truncate')}>
                  {draftProvince.toUpperCase()}
                </span>
              </SelectShell>
            </div>
          </div>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
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
          <PrimaryButton type="submit" className="flex-1" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Guardando…
              </>
            ) : (
              'Guardar cambios'
            )}
          </PrimaryButton>
        </div>
      </form>
    </div>
  )
}
