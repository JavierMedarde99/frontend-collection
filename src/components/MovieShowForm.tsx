import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { MEDIA_TYPES, MOVIE_SHOW_STATES } from '../constants/movieshows'
import { MediaType, MovieShowStatus } from '../types'
import type { MovieShowFormData } from '../types'
import StarRating from './StarRating'
import ConfirmDialog from './ConfirmDialog'
import ImageUpload from './ImageUpload'
import { useUnsavedGuard } from '../hooks/useUnsavedGuard'
import FormSection from './FormSection'
import GenreSelect from './GenreSelect'
import { MOVIESHOW_GENRES } from '../constants/genres'
import { listMovieShowGenres } from '../api/movieshowsApi'

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
    genres: [],
    ...initial,
  })
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const guard = useUnsavedGuard(dirty)
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

    const payload: MovieShowFormData = {
      title: form.title.trim(),
      mediaType: form.mediaType,
      status: form.status,
      genres: form.genres ?? [],
      // El backend exige externalId: si viene de TMDB se conserva, si es
      // alta manual se genera uno para no pedirlo en el formulario.
      externalId: initial.externalId?.trim() || `manual-${Date.now()}`,
      overview: form.overview?.trim() || undefined,
      releaseDate: form.releaseDate || undefined,
      posterUrl: form.posterUrl?.trim() || undefined,
      voteAverage: form.voteAverage,
      userRating: showRating && form.userRating ? form.userRating : undefined,
      comment: showComment ? form.comment?.trim() || undefined : undefined,
      dateAdded: showStartDate ? form.dateAdded || undefined : undefined,
      dateCompleted: showEndDate ? form.dateCompleted || undefined : undefined,
      // Datos venidos de TMDB: se conservan sin mostrarse en el formulario manual.
      ...(initial.backdropUrl ? { backdropUrl: initial.backdropUrl } : {}),
      ...(initial.externalSource ? { externalSource: initial.externalSource } : {}),
    }

    setSubmitting(true)
    setDirty(false)
    try {
      await onSubmit(payload)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la película/serie.'
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
          <Field label="Fecha de estreno">
            <input className="input" type="date" value={form.releaseDate} onChange={set('releaseDate')} />
          </Field>
        </div>
        <div className="mt-6">
          <Field label="Géneros">
            <GenreSelect
              options={MOVIESHOW_GENRES}
              value={form.genres ?? []}
              onChange={(genres) => setForm((f) => ({ ...f, genres }))}
              fetchSuggestions={listMovieShowGenres}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Portada">
        <ImageUpload
          label="Foto de portada"
          value={form.posterUrl || ''}
          onChange={(url) => setForm((f) => ({ ...f, posterUrl: url }))}
          onTouched={() => setDirty(true)}
        />
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
              <StarRating value={form.userRating} onChange={(n) => { setDirty(true); setForm((f) => ({ ...f, userRating: n })) }} />
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
