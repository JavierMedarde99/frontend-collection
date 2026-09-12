import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { GAME_PLATFORMS, GAME_STATES } from '../constants/games'
import { GamePlatform, GameStatus } from '../types'
import type { GameFormData } from '../types'
import StarRating from './StarRating'
import FormSection from './FormSection'

type IconName = 'title' | 'thumbnail' | 'externalId' | 'date' | 'comment' | 'source' | 'steam'

const ICONS: Record<IconName, ReactNode> = {
  title: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  ),
  thumbnail: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  ),
  externalId: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  ),
  date: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  ),
  comment: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
  ),
  source: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  ),
  steam: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
  ),
}

interface FieldIconProps {
  name?: IconName
}

function FieldIcon({ name }: FieldIconProps) {
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

interface FieldProps {
  label: string
  children: ReactNode
  required?: boolean
  icon?: IconName
}

function Field({ label, children, required, icon }: FieldProps) {
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

interface GameFormProps {
  initial?: Partial<GameFormData>
  submitLabel: string
  onSubmit: (payload: GameFormData) => Promise<void>
  error?: string | null
  isCreate?: boolean
}

export default function GameForm({ initial = {}, submitLabel, onSubmit, error, isCreate = false }: GameFormProps) {
  const [form, setForm] = useState<GameFormData>({
    title: '',
    platform: GamePlatform.PC,
    status: GameStatus.WISHLIST,
    thumbnailUrl: '',
    userRating: 0,
    comment: '',
    dateAdded: '',
    dateCompleted: '',
    externalSource: '',
    externalId: '',
    obtainPlatinum: false,
    steamAppId: '',
    ...initial,
  })
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const showStartDate =
    form.status === GameStatus.PLAYING ||
    form.status === GameStatus.ABANDONED ||
    form.status === GameStatus.COMPLETED
  const showEndDate = form.status === GameStatus.COMPLETED
  const showRating = form.status === GameStatus.COMPLETED
  const showComment = form.status === GameStatus.COMPLETED

  const set = (key: keyof GameFormData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)

    if (!form.title.trim()) return setLocalError('El título es obligatorio.')
    if (!form.platform) return setLocalError('La plataforma es obligatoria.')
    if (!form.status) return setLocalError('El estado es obligatorio.')

    const payload: GameFormData = {
      title: form.title.trim(),
      platform: form.platform,
      status: form.status,
      thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
      userRating: showRating && form.userRating ? form.userRating : undefined,
      comment: form.comment?.trim() || undefined,
      dateAdded: form.dateAdded || undefined,
      dateCompleted: form.dateCompleted || undefined,
      obtainPlatinum:
        form.platform === GamePlatform.PC && form.obtainPlatinum ? true : undefined,
      steamAppId:
        form.platform === GamePlatform.PC && form.steamAppId
          ? form.steamAppId.trim()
          : undefined,
      ...(isCreate ? {} : { externalSource: form.externalSource?.trim() || undefined, externalId: form.externalId?.trim() || undefined }),
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el videojuego.'
      setLocalError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-6">
      <FormSection title="Información básica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Título" required icon="title">
            <input className="input" value={form.title} onChange={set('title')} placeholder="Título del videojuego" />
          </Field>
          <Field label="Plataforma" required>
            <select className="input" value={form.platform} onChange={set('platform')}>
              {Object.entries(GAME_PLATFORMS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Estado" required>
            <select className="input" value={form.status} onChange={set('status')}>
              {Object.entries(GAME_STATES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          {form.platform === GamePlatform.PC && (
            <Field label="Objetivo">
              <label className="flex items-center gap-2.5 text-body cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-brand"
                  checked={form.obtainPlatinum === true}
                  onChange={(e) => setForm((f) => ({ ...f, obtainPlatinum: e.target.checked }))}
                />
                Platinar
              </label>
            </Field>
          )}
          {form.platform === GamePlatform.PC && (
            <Field label="Steam App ID" icon="steam">
              <input
                className="input"
                value={form.steamAppId}
                onChange={set('steamAppId')}
                placeholder="Ej: 730"
              />
            </Field>
          )}
        </div>
      </FormSection>

      {!isCreate && (
        <FormSection title="Multimedia">
          <Field label="URL de imagen" icon="thumbnail">
            <input className="input" value={form.thumbnailUrl} onChange={set('thumbnailUrl')} placeholder="https://…" />
          </Field>
        </FormSection>
      )}

      {(showStartDate || showEndDate) && (
        <FormSection title="Fechas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showStartDate && (
              <Field label="Fecha de inicio" icon="date">
                <input className="input" type="date" value={form.dateAdded} onChange={set('dateAdded')} />
              </Field>
            )}
            {showEndDate && (
              <Field label="Fecha de fin" icon="date">
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
      </FormSection>

      {!isCreate && (
        <FormSection title="Externo">
          <Field label="Fuente externa" icon="source">
            <input className="input" value={form.externalSource} onChange={set('externalSource')} placeholder="Opcional" />
          </Field>
          <Field label="ID externo" icon="externalId">
            <input className="input" value={form.externalId} onChange={set('externalId')} placeholder="Opcional" />
          </Field>
        </FormSection>
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
