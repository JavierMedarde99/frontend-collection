import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AMIIBO_TYPE_LABELS, FIGURE_STATUS_LABELS } from '../constants/figures'
import { AmiiboStatus, AmiiboType } from '../types'
import type { AmiiboFormData, AmiiboReleaseDates } from '../types'
import FormSection from './FormSection'
import ImageUpload from './ImageUpload'
import ConfirmDialog from './ConfirmDialog'
import { useUnsavedGuard } from '../hooks/useUnsavedGuard'
import { todayIso, missingRequiredDate } from '../utils/dates'

interface FieldProps {
  label: string
  children: ReactNode
  required?: boolean
}

function Field({ label, children, required }: FieldProps) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {children}
    </div>
  )
}

function toCSV(value?: string[]): string {
  return (value || []).join(', ')
}

function fromCSV(value: string): string[] | undefined {
  const items = value.split(',').map((s) => s.trim()).filter(Boolean)
  return items.length > 0 ? items : undefined
}

interface AmiiboFormProps {
  initial?: Partial<AmiiboFormData>
  submitLabel: string
  onSubmit: (payload: AmiiboFormData) => Promise<void>
  error?: string | null
  isCreate?: boolean
}

export default function AmiiboForm({ initial = {}, submitLabel, onSubmit, error, isCreate = false }: AmiiboFormProps) {
  const [name, setName] = useState(initial.name || '')
  const [character, setCharacter] = useState(initial.character || '')
  const [amiiboSeries, setAmiiboSeries] = useState(initial.amiiboSeries || '')
  const [gameSeries, setGameSeries] = useState(initial.gameSeries || '')
  const [amiiboType, setAmiiboType] = useState<AmiiboType | ''>(initial.amiiboType || '')
  const [releaseAu, setReleaseAu] = useState(initial.releaseDates?.au || '')
  const [releaseEu, setReleaseEu] = useState(initial.releaseDates?.eu || '')
  const [releaseJp, setReleaseJp] = useState(initial.releaseDates?.jp || '')
  const [releaseNa, setReleaseNa] = useState(initial.releaseDates?.na || '')
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || '')
  const [compatibleGames, setCompatibleGames] = useState(toCSV(initial.compatibleGames))
  const [status, setStatus] = useState<AmiiboStatus>(initial.status || AmiiboStatus.OWNED)
  const [notes, setNotes] = useState(initial.notes || '')
  // La fecha de adición es opcional; al crear se propone hoy.
  const [dateAdded, setDateAdded] = useState(initial.dateAdded || (isCreate ? todayIso() : ''))
  // La adquisición solo tiene sentido cuando el Amiibo está en posesión; al crear
  // se propone hoy, al editar NO se inventa (si faltaba, el usuario debe ponerla).
  const [acquisitionDate, setAcquisitionDate] = useState(
    initial.acquisitionDate || (isCreate ? todayIso() : ''),
  )
  const [acquisitionPrice, setAcquisitionPrice] = useState(
    initial.acquisitionPrice === undefined || initial.acquisitionPrice === ''
      ? ''
      : String(initial.acquisitionPrice),
  )
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const guard = useUnsavedGuard(dirty)

  const set =
    (setter: (v: string) => void) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setter(e.target.value)
    }

  // En la lista de deseos el Amiibo aún no se tiene: no hay fecha ni precio de
  // adquisición que rellenar.
  const showAcquisition = status !== AmiiboStatus.WISHLIST

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (!name.trim()) return setLocalError('El nombre es obligatorio.')
    if (!status) return setLocalError('El estado es obligatorio.')
    if (showAcquisition) {
      const dateError = missingRequiredDate(acquisitionDate, 'La fecha de obtención')
      if (dateError) return setLocalError(dateError)
    }

    const releases: AmiiboReleaseDates = {
      au: releaseAu || undefined,
      eu: releaseEu || undefined,
      jp: releaseJp || undefined,
      na: releaseNa || undefined,
    }
    const hasReleaseDates = Object.values(releases).some(Boolean)

    const payload: AmiiboFormData = {
      // El backend exige externalId: si viene del catálogo se conserva,
      // si es alta manual se genera uno para no pedirlo en el formulario.
      externalId: initial.externalId?.trim() || `manual-${Date.now()}`,
      name: name.trim(),
      status,
      character: character.trim() || undefined,
      amiiboSeries: amiiboSeries.trim() || undefined,
      gameSeries: gameSeries.trim() || undefined,
      amiiboType: amiiboType || undefined,
      releaseDates: hasReleaseDates ? releases : undefined,
      imageUrl: imageUrl.trim() || undefined,
      compatibleGames: fromCSV(compatibleGames),
      notes: notes.trim() || undefined,
      dateAdded: dateAdded || undefined,
      ...(showAcquisition && acquisitionDate ? { acquisitionDate } : {}),
      ...(showAcquisition && acquisitionPrice !== '' ? { acquisitionPrice: Number(acquisitionPrice) } : {}),
      // Datos venidos del catálogo: se conservan sin mostrarse en el formulario.
      ...(initial.externalSource ? { externalSource: initial.externalSource } : {}),
    }

    setSubmitting(true)
    setDirty(false)
    try {
      await onSubmit(payload)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el Amiibo.'
      setLocalError(message)
      setDirty(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="flex flex-col gap-6">
      <FormSection title="Información básica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Nombre" required>
            <input className="input" value={name} onChange={set(setName)} placeholder="Nombre del Amiibo" />
          </Field>
          <Field label="Estado" required>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as AmiiboStatus)}>
              {Object.entries(FIGURE_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Personaje">
            <input className="input" value={character} onChange={set(setCharacter)} placeholder="Ej: Mario" />
          </Field>
          <Field label="Tipo de Amiibo">
            <select className="input" value={amiiboType} onChange={(e) => setAmiiboType(e.target.value as AmiiboType | '')}>
              <option value="">Sin especificar</option>
              {Object.entries(AMIIBO_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Serie Amiibo">
            <input className="input" value={amiiboSeries} onChange={set(setAmiiboSeries)} placeholder="Ej: Super Smash Bros." />
          </Field>
          <Field label="Serie de juego">
            <input className="input" value={gameSeries} onChange={set(setGameSeries)} placeholder="Ej: Super Mario" />
          </Field>

          <Field label="Fecha de adición">
            <input className="input" type="date" value={dateAdded} onChange={set(setDateAdded)} />
          </Field>
        </div>
      </FormSection>

      {showAcquisition && (
        <FormSection title="Adquisición">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Fecha de obtención" required>
              <input className="input" type="date" value={acquisitionDate} onChange={set(setAcquisitionDate)} />
            </Field>
            <Field label="Precio de adquisición">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={acquisitionPrice}
                onChange={set(setAcquisitionPrice)}
                placeholder="14.99"
              />
            </Field>
          </div>
        </FormSection>
      )}

      <FormSection title="Fechas de lanzamiento">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Field label="Australia">
            <input className="input" type="date" value={releaseAu} onChange={set(setReleaseAu)} />
          </Field>
          <Field label="Europa">
            <input className="input" type="date" value={releaseEu} onChange={set(setReleaseEu)} />
          </Field>
          <Field label="Japón">
            <input className="input" type="date" value={releaseJp} onChange={set(setReleaseJp)} />
          </Field>
          <Field label="EE. UU.">
            <input className="input" type="date" value={releaseNa} onChange={set(setReleaseNa)} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Imagen">
        <ImageUpload
          label="Foto del Amiibo"
          value={imageUrl}
          onChange={(url) => { setImageUrl(url); setDirty(true) }}
        />
      </FormSection>

      <FormSection title="Juegos compatibles y notas">
        <Field label="Juegos compatibles (separados por comas)">
          <input className="input" value={compatibleGames} onChange={set(setCompatibleGames)} placeholder="Ej: Super Mario Odyssey, Mario Kart 8" />
        </Field>
        <Field label="Notas">
          <textarea
            className="input !h-auto !min-h-[80px] !py-3"
            value={notes}
            onChange={set(setNotes)}
            placeholder="Notas personales…"
          />
        </Field>
      </FormSection>

      {(error || localError) && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error || localError}
        </div>
      )}

      <div className="form-actions">
        <Link className="btn-ghost !px-4 !py-2" to="/figuras/amiibo">
          Cancelar
        </Link>
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : submitLabel}
        </button>
      </div>

      <ConfirmDialog
        open={guard.showPrompt}
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. ¿Seguro que quieres salir? Se perderán."
        confirmLabel="Salir sin guardar"
        onConfirm={guard.confirmNavigation}
        onCancel={guard.cancelNavigation}
      />
    </form>
  )
}
