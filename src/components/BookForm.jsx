import { useState } from 'react'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import StarRating from './StarRating'

const ICONS = {
  title: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  ),
  author: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  ),
  pages: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  ),
  cover: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3l13.5 13.5M21.75 9.75L14.25 3l6.75-2.25L19.5 10.5M4.5 9.75l.75 7.5 2.25 2.25 4.5-4.5-1.5-6M4.5 3l-2.25 13.5L4.5 21l5.25-5.25" />
  ),
  externalId: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  ),
  date: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  ),
  synopsis: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  ),
  comment: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
  ),
}

function FieldIcon({ name }) {
  if (!name) return null
  return (
    <svg
      aria-hidden="true"
      className="w-5 h-5 text-stone absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      {ICONS[name]}
    </svg>
  )
}

function Field({ label, children, required, icon }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {icon ? (
        <div className="relative">
          <FieldIcon name={icon} />
          <div className="[&>input]:!pl-11 [&>select]:!pl-11 [&>textarea]:!pl-11">
            {children}
          </div>
        </div>
      ) : (
        children
      )}
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
        <Field label="Título" required icon="title">
          <input className="input" value={form.title} onChange={set('title')} placeholder="Título del libro" />
        </Field>
        <Field label="Autor" required icon="author">
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

        <Field label="Nº de páginas" icon="pages">
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
          <Field label="URL de portada" icon="cover">
            <input
              className="input"
              value={form.frontpage}
              onChange={set('frontpage')}
              placeholder="https://…"
            />
          </Field>
        )}

        {showStartDate && (
          <Field label="Fecha de inicio" icon="date">
            <input className="input" type="date" value={form.startDate} onChange={set('startDate')} />
          </Field>
        )}
        {showEndDate && (
          <Field label="Fecha de fin" icon="date">
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
          <Field label="ID externo (Google Books)" icon="externalId">
            <input
              className="input"
              value={form.externalId}
              onChange={set('externalId')}
              placeholder="Opcional"
            />
          </Field>
        )}
      </div>

      <Field label="Sinopsis" icon="synopsis">
        <textarea
          className="input !h-auto !min-h-[120px] !py-3"
          value={form.descripcion}
          onChange={set('descripcion')}
          placeholder="Sinopsis del libro…"
        />
      </Field>

      {showComment && (
        <Field label="Comentario" icon="comment">
          <textarea
            className="input !h-auto !min-h-[100px] !py-3"
            value={form.comment}
            onChange={set('comment')}
            placeholder="Notas personales…"
          />
        </Field>
      )}

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