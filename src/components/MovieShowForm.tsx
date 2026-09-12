import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { MEDIA_TYPES, MOVIE_SHOW_STATES } from '../constants/movieshows'
import { MediaType, MovieShowStatus } from '../types'
import type { MovieShowFormData } from '../types'
import StarRating from './StarRating'
import FormSection from './FormSection'

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

interface MovieShowFormProps {
  initial?: Partial<MovieShowFormData>
  submitLabel: string
  onSubmit: (payload: MovieShowFormData) => Promise<void>
  error?: string | null
}

export default function MovieShowForm({ initial = {}, submitLabel, onSubmit, error }: MovieShowFormProps) {
  const [form, setForm] = useState<MovieShowFormData>({
    title: '',
    mediaType: MediaType.MOVIE,
    status: MovieShowStatus.PLAN_TO_WATCH,
    overview: '',
    releaseDate: '',
    posterUrl: '',
    backdropUrl: '',
    externalSource: '',
    externalId: '',
    comment: '',
    dateAdded: '',
    dateCompleted: '',
    userRating: 0,
    ...initial,
  })
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const showStartDate =
    form.status === MovieShowStatus.WATCHING ||
    form.status === MovieShowStatus.WATCHED
  const showEndDate = form.status === MovieShowStatus.WATCHED
  const showRating = form.status === MovieShowStatus.WATCHED
  const showComment = form.status === MovieShowStatus.WATCHED

  const set = (key: keyof MovieShowFormData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (!form.title.trim()) return setLocalError('El título es obligatorio.')
    if (!form.mediaType) return setLocalError('El tipo es obligatorio.')
    if (!form.status) return setLocalError('El estado es obligatorio.')
    if (!form.externalId?.trim()) return setLocalError('El ID externo es obligatorio (lo exige el backend).')

    const payload: MovieShowFormData = {
      title: form.title.trim(),
      mediaType: form.mediaType,
      status: form.status,
      externalId: form.externalId.trim(),
      overview: form.overview?.trim() || undefined,
      releaseDate: form.releaseDate || undefined,
      posterUrl: form.posterUrl?.trim() || undefined,
      backdropUrl: form.backdropUrl?.trim() || undefined,
      voteAverage: form.voteAverage,
      userRating: showRating && form.userRating ? form.userRating : undefined,
      comment: showComment ? form.comment?.trim() || undefined : undefined,
      dateAdded: showStartDate ? form.dateAdded || undefined : undefined,
      dateCompleted: showEndDate ? form.dateCompleted || undefined : undefined,
      externalSource: form.externalSource?.trim() || undefined,
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la película/serie.'
      setLocalError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-6">
      <FormSection title="Información básica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Título" required>
            <input className="input" value={form.title} onChange={set('title')} placeholder="Título" />
          </Field>
          <Field label="Tipo" required>
            <select className="input" value={form.mediaType} onChange={set('mediaType')}>
              {Object.entries(MEDIA_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Estado" required>
            <select className="input" value={form.status} onChange={set('status')}>
              {Object.entries(MOVIE_SHOW_STATES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ID externo (TMDB)" required>
            <input className="input" value={form.externalId} onChange={set('externalId')} placeholder="Ej: 438631" />
          </Field>

          <Field label="Fecha de estreno">
            <input className="input" type="date" value={form.releaseDate} onChange={set('releaseDate')} />
          </Field>
          <Field label="Fuente externa">
            <input className="input" value={form.externalSource} onChange={set('externalSource')} placeholder="Opcional" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Multimedia">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="URL del póster">
            <input className="input" value={form.posterUrl} onChange={set('posterUrl')} placeholder="https://…" />
          </Field>
          <Field label="URL del backdrop">
            <input className="input" value={form.backdropUrl} onChange={set('backdropUrl')} placeholder="https://…" />
          </Field>
        </div>
      </FormSection>

      {(showStartDate || showEndDate) && (
        <FormSection title="Fechas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showStartDate && (
              <Field label="Fecha de inicio">
                <input className="input" type="date" value={form.dateAdded} onChange={set('dateAdded')} />
              </Field>
            )}
            {showEndDate && (
              <Field label="Fecha de fin">
                <input className="input" type="date" value={form.dateCompleted} onChange={set('dateCompleted')} />
              </Field>
            )}
          </div>
        </FormSection>
      )}

      <FormSection title="Valoración y notas">
        {showRating && (
          <Field label="Valoración">
            <div className="pt-2">
              <StarRating value={form.userRating} onChange={(n) => setForm((f) => ({ ...f, userRating: n }))} />
            </div>
          </Field>
        )}
        <Field label="Sinopsis">
          <textarea
            className="input !h-auto !min-h-[100px] !py-3"
            value={form.overview}
            onChange={set('overview')}
            placeholder="Sinopsis…"
          />
        </Field>

        {showComment && (
          <Field label="Comentario">
            <textarea
              className="input !h-auto !min-h-[100px] !py-3"
              value={form.comment}
              onChange={set('comment')}
              placeholder="Notas personales…"
            />
          </Field>
        )}
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
    </form>
  )
}
