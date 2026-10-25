import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FIGURE_STATUS_LABELS } from '../constants/figures'
import { FunkoStatus } from '../types'
import type { FunkoFormData } from '../types'
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

function toNumberInput(value?: number | ''): string {
  return value === undefined || value === null || value === '' ? '' : String(value)
}

function fromNumberInput(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

interface FunkoFormProps {
  initial?: Partial<FunkoFormData>
  submitLabel: string
  onSubmit: (payload: FunkoFormData) => Promise<void>
  error?: string | null
  isCreate?: boolean
}

export default function FunkoForm({ initial = {}, submitLabel, onSubmit, error, isCreate = false }: FunkoFormProps) {
  const [name, setName] = useState(initial.name || '')
  const [series, setSeries] = useState(initial.series || '')
  const [number, setNumber] = useState(initial.number || '')
  const [category, setCategory] = useState(initial.category || '')
  const [exclusive, setExclusive] = useState(initial.exclusive || '')
  const [vaulted, setVaulted] = useState(initial.vaulted ?? false)
  const [releaseYear, setReleaseYear] = useState(toNumberInput(initial.releaseYear))
  const [franchise, setFranchise] = useState(initial.franchise || '')
  const [popType, setPopType] = useState(initial.popType || '')
  const [rarityScore, setRarityScore] = useState(toNumberInput(initial.rarityScore))
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || '')
  const [status, setStatus] = useState<FunkoStatus>(initial.status || FunkoStatus.OWNED)
  const [notes, setNotes] = useState(initial.notes || '')
  // La fecha de adición es opcional; al crear se propone hoy.
  const [dateAdded, setDateAdded] = useState(initial.dateAdded || (isCreate ? todayIso() : ''))
  // La adquisición solo tiene sentido cuando la pieza está en posesión; al crear
  // se propone hoy, al editar NO se inventa (si faltaba, el usuario debe ponerla).
  const [acquisitionDate, setAcquisitionDate] = useState(
    initial.acquisitionDate || (isCreate ? todayIso() : ''),
  )
  const [acquisitionPrice, setAcquisitionPrice] = useState(toNumberInput(initial.acquisitionPrice))
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const guard = useUnsavedGuard(dirty)

  const set =
    (setter: (v: string) => void) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setter(e.target.value)
    }

  // En la lista de deseos la pieza aún no se tiene: no hay fecha ni precio de
  // adquisición que rellenar.
  const showAcquisition = status !== FunkoStatus.WISHLIST

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (!name.trim()) return setLocalError('El nombre es obligatorio.')
    if (!status) return setLocalError('El estado es obligatorio.')
    if (showAcquisition) {
      const dateError = missingRequiredDate(acquisitionDate, 'La fecha de obtención')
      if (dateError) return setLocalError(dateError)
    }

    const payload: FunkoFormData = {
      // El backend exige externalId: si viene del catálogo se conserva,
      // si es alta manual se genera uno para no pedirlo en el formulario.
      externalId: initial.externalId?.trim() || `manual-${Date.now()}`,
      name: name.trim(),
      status,
      series: series.trim() || undefined,
      number: number.trim() || undefined,
      category: category.trim() || undefined,
      exclusive: exclusive.trim() || undefined,
      vaulted: vaulted || undefined,
      releaseYear: fromNumberInput(releaseYear),
      franchise: franchise.trim() || undefined,
      popType: popType.trim() || undefined,
      rarityScore: fromNumberInput(rarityScore),
      imageUrl: imageUrl.trim() || undefined,
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
      const message = err instanceof Error ? err.message : 'No se pudo guardar el Funko Pop.'
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
            <input className="input" value={name} onChange={set(setName)} placeholder="Nombre del Funko Pop" />
          </Field>
          <Field label="Estado" required>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as FunkoStatus)}>
              {Object.entries(FIGURE_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Serie">
            <input className="input" value={series} onChange={set(setSeries)} placeholder="Ej: Heroes" />
          </Field>
          <Field label="Número">
            <input className="input" value={number} onChange={set(setNumber)} placeholder="Ej: 25" />
          </Field>

          <Field label="Franquicia">
            <input className="input" value={franchise} onChange={set(setFranchise)} placeholder="Ej: DC Comics" />
          </Field>
          <Field label="Categoría">
            <input className="input" value={category} onChange={set(setCategory)} placeholder="Ej: Vinyl" />
          </Field>

          <Field label="Tipo de Pop">
            <input className="input" value={popType} onChange={set(setPopType)} placeholder="Ej: Pop! Vinyl" />
          </Field>
          <Field label="Exclusivo">
            <input className="input" value={exclusive} onChange={set(setExclusive)} placeholder="Ej: Comic Con" />
          </Field>

          <Field label="Año de lanzamiento">
            <input className="input" type="number" min="0" value={releaseYear} onChange={set(setReleaseYear)} placeholder="Ej: 2019" />
          </Field>
          <Field label="Puntuación de rareza">
            <input className="input" type="number" min="0" value={rarityScore} onChange={set(setRarityScore)} placeholder="Ej: 7" />
          </Field>

          <Field label="Fecha de adición">
            <input className="input" type="date" value={dateAdded} onChange={set(setDateAdded)} />
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-body text-ink cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={vaulted}
                onChange={(e) => setVaulted(e.target.checked)}
              />
              Vaulted
            </label>
          </div>
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
                placeholder="24.99"
              />
            </Field>
          </div>
        </FormSection>
      )}

      <FormSection title="Imagen">
        <ImageUpload
          label="Foto del Funko Pop"
          value={imageUrl}
          onChange={(url) => { setImageUrl(url); setDirty(true) }}
        />
      </FormSection>

      <FormSection title="Notas">
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
        <Link className="btn-ghost !px-4 !py-2" to="/figuras/funkopop">
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
