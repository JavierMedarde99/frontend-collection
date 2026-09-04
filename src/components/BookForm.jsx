import { useState } from 'react'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import StarRating from './StarRating'

function Field({ label, children, required }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-action-blue">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function BookForm({ initial = {}, submitLabel, onSubmit, error, isCreate = false }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    type: 'NOVEL',
    state: 'TO_READ',
    descripcion: '',
    pages: '',
    comment: '',
    start: 0,
    startDate: '',
    endDate: '',
    frontpage: '',
    externalId: '',
    ...initial,
  })
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)

  const showStartDate = form.state !== 'TO_READ'
  const showEndDate = form.state === 'COMPLETED'
  const showRating = form.state === 'COMPLETED'
  const showComment = form.state === 'COMPLETED'

  const set = (key) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }
  const setNumber = (key) => (e) => {
    const v = e.target.value
    setForm((f) => ({ ...f, [key]: v === '' ? '' : Number(v) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)

    if (!form.title.trim()) return setLocalError('El título es obligatorio.')
    if (!form.author.trim()) return setLocalError('El autor es obligatorio.')
    if (!form.type) return setLocalError('El tipo es obligatorio.')
    if (!form.state) return setLocalError('El estado es obligatorio.')

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      type: form.type,
      state: form.state,
      descripcion: form.descripcion?.trim() || undefined,
      pages: form.pages === '' ? undefined : form.pages,
      ...(showComment ? { comment: form.comment?.trim() || undefined } : {}),
      ...(showRating ? { start: form.start || undefined } : {}),
      ...(showStartDate ? { startDate: form.startDate || undefined } : {}),
      ...(showEndDate ? { endDate: form.endDate || undefined } : {}),
      ...(isCreate ? {} : { frontpage: form.frontpage?.trim() || undefined, externalId: form.externalId?.trim() || undefined }),
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      setLocalError(err.message || 'No se pudo guardar el libro.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Título" required>
          <input className="input" value={form.title} onChange={set('title')} placeholder="Título del libro" />
        </Field>
        <Field label="Autor" required>
          <input className="input" value={form.author} onChange={set('author')} placeholder="Autor" />
        </Field>

        <Field label="Tipo" required>
          <select className="input" value={form.type} onChange={set('type')}>
            {Object.entries(BOOK_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estado" required>
          <select className="input" value={form.state} onChange={set('state')}>
            {Object.entries(BOOK_STATES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nº de páginas">
          <input
            className="input"
            type="number"
            min="0"
            value={form.pages}
            onChange={setNumber('pages')}
            placeholder="120"
          />
        </Field>
        {!isCreate && (
          <Field label="URL de portada">
            <input
              className="input"
              value={form.frontpage}
              onChange={set('frontpage')}
              placeholder="https://…"
            />
          </Field>
        )}

        {showStartDate && (
          <Field label="Fecha de inicio">
            <input className="input" type="date" value={form.startDate} onChange={set('startDate')} />
          </Field>
        )}
        {showEndDate && (
          <Field label="Fecha de fin">
            <input className="input" type="date" value={form.endDate} onChange={set('endDate')} />
          </Field>
        )}

        {showRating && (
          <Field label="Valoración">
            <div className="pt-2">
              <StarRating value={form.start} onChange={(n) => setForm((f) => ({ ...f, start: n }))} />
            </div>
          </Field>
        )}
        {!isCreate && (
          <Field label="ID externo (Google Books)">
            <input
              className="input"
              value={form.externalId}
              onChange={set('externalId')}
              placeholder="Opcional"
            />
          </Field>
        )}
      </div>

      <Field label="Sinopsis">
        <textarea
          className="input !h-auto !min-h-[120px] !py-3"
          value={form.descripcion}
          onChange={set('descripcion')}
          placeholder="Sinopsis del libro…"
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

      {(error || localError) && (
        <p className="text-sm text-red-600" role="alert">
          {error || localError}
        </p>
      )}

      <div className="flex justify-end">
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
