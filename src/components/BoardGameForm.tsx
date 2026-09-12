import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { BOARD_GAME_STATES } from '../constants/boardGames'
import { BoardGameStatus } from '../types'
import type { BoardGameFormData } from '../types'
import FormSection from './FormSection'
import ConfirmDialog from './ConfirmDialog'
import { useUnsavedGuard } from '../hooks/useUnsavedGuard'

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

function toNumberInput(value?: number): string {
  return value === undefined || value === null ? '' : String(value)
}

function fromNumberInput(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

interface BoardGameFormProps {
  initial?: Partial<BoardGameFormData>
  submitLabel: string
  onSubmit: (payload: BoardGameFormData) => Promise<void>
  error?: string | null
}

export default function BoardGameForm({ initial = {}, submitLabel, onSubmit, error }: BoardGameFormProps) {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [yearPublished, setYearPublished] = useState(toNumberInput(initial.yearPublished))
  const [minPlayers, setMinPlayers] = useState(toNumberInput(initial.minPlayers))
  const [maxPlayers, setMaxPlayers] = useState(toNumberInput(initial.maxPlayers))
  const [minPlaytime, setMinPlaytime] = useState(toNumberInput(initial.minPlaytime))
  const [maxPlaytime, setMaxPlaytime] = useState(toNumberInput(initial.maxPlaytime))
  const [publisher, setPublisher] = useState(initial.publisher || '')
  const [designers, setDesigners] = useState(toCSV(initial.designers))
  const [categories, setCategories] = useState(toCSV(initial.categories))
  const [mechanics, setMechanics] = useState(toCSV(initial.mechanics))
  const [imageUrl, setImageUrl] = useState(initial.imageUrl || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initial.thumbnailUrl || '')
  const [status, setStatus] = useState<BoardGameStatus>(initial.status || BoardGameStatus.OWNED)
  const [bggRating, setBggRating] = useState(toNumberInput(initial.bggRating))
  const [notes, setNotes] = useState(initial.notes || '')
  const [dateAdded, setDateAdded] = useState(initial.dateAdded || '')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const guard = useUnsavedGuard(dirty)

  const set =
    (setter: (v: string) => void) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setter(e.target.value)
    }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (!title.trim()) return setLocalError('El título es obligatorio.')
    if (!status) return setLocalError('El estado es obligatorio.')

    const payload: BoardGameFormData = {
      title: title.trim(),
      status,
      description: description.trim() || undefined,
      yearPublished: fromNumberInput(yearPublished),
      minPlayers: fromNumberInput(minPlayers),
      maxPlayers: fromNumberInput(maxPlayers),
      minPlaytime: fromNumberInput(minPlaytime),
      maxPlaytime: fromNumberInput(maxPlaytime),
      publisher: publisher.trim() || undefined,
      designers: fromCSV(designers),
      categories: fromCSV(categories),
      mechanics: fromCSV(mechanics),
      imageUrl: imageUrl.trim() || undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      bggRating: fromNumberInput(bggRating),
      notes: notes.trim() || undefined,
      dateAdded: status === BoardGameStatus.OWNED ? dateAdded || undefined : undefined,
      ...(initial.bggId ? { bggId: initial.bggId } : {}),
    }

    setSubmitting(true)
    setDirty(false)
    try {
      await onSubmit(payload)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el juego de mesa.'
      setLocalError(message)
      setDirty(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setDirty(true)} className="card flex flex-col gap-6">
      <FormSection title="Información básica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Título" required>
            <input className="input" value={title} onChange={set(setTitle)} placeholder="Título del juego" />
          </Field>
          <Field label="Estado" required>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as BoardGameStatus)}>
              {Object.entries(BOARD_GAME_STATES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Año de publicación">
            <input className="input" type="number" min="0" value={yearPublished} onChange={set(setYearPublished)} placeholder="Ej: 1995" />
          </Field>
          <Field label="Editorial">
            <input className="input" value={publisher} onChange={set(setPublisher)} placeholder="Publisher" />
          </Field>

          <Field label="Jugadores mínimos">
            <input className="input" type="number" min="1" value={minPlayers} onChange={set(setMinPlayers)} placeholder="Ej: 2" />
          </Field>
          <Field label="Jugadores máximos">
            <input className="input" type="number" min="1" value={maxPlayers} onChange={set(setMaxPlayers)} placeholder="Ej: 4" />
          </Field>

          <Field label="Duración mínima (min)">
            <input className="input" type="number" min="1" value={minPlaytime} onChange={set(setMinPlaytime)} placeholder="Ej: 30" />
          </Field>
          <Field label="Duración máxima (min)">
            <input className="input" type="number" min="1" value={maxPlaytime} onChange={set(setMaxPlaytime)} placeholder="Ej: 90" />
          </Field>

          <Field label="Diseñadores (separados por comas)">
            <input className="input" value={designers} onChange={set(setDesigners)} placeholder="Ej: Klaus Teuber" />
          </Field>
          <Field label="Categorías (separadas por comas)">
            <input className="input" value={categories} onChange={set(setCategories)} placeholder="Ej: Estrategia, Familiar" />
          </Field>

          <Field label="Mecánicas (separadas por comas)">
            <input className="input" value={mechanics} onChange={set(setMechanics)} placeholder="Ej: Dados, Losetas" />
          </Field>
          <Field label="Rating BGG (0–10)">
            <input className="input" type="number" min="0" max="10" step="0.1" value={bggRating} onChange={set(setBggRating)} placeholder="Ej: 7.2" />
          </Field>

          {status === BoardGameStatus.OWNED && (
            <Field label="Fecha de adición">
              <input className="input" type="date" value={dateAdded} onChange={set(setDateAdded)} />
            </Field>
          )}
        </div>
      </FormSection>

      <FormSection title="Multimedia">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="URL de imagen">
            <input className="input" value={imageUrl} onChange={set(setImageUrl)} placeholder="https://…" />
          </Field>
          <Field label="URL de miniatura">
            <input className="input" value={thumbnailUrl} onChange={set(setThumbnailUrl)} placeholder="https://…" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Descripción y notas">
        <Field label="Descripción">
          <textarea
            className="input !h-auto !min-h-[100px] !py-3"
            value={description}
            onChange={set(setDescription)}
            placeholder="Descripción del juego…"
          />
        </Field>

        <Field label="Notas personales">
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

      <div className="flex justify-end border-t border-silver/60 pt-5">
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
