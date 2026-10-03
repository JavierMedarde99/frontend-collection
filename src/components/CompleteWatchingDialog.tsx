import { useState } from 'react'
import { createPortal } from 'react-dom'
import { missingRequiredDate, todayIso } from '../utils/dates'
import StarRating from './StarRating'

export interface CompleteWatchingDialogProps {
  /** Fecha de fin actual, si la tiene. */
  dateValue?: string
  /** Valoración actual (1-5), si la tiene. */
  ratingValue?: number
  /** Comentario actual, si lo tiene. */
  commentValue?: string
  onSave: (dateCompleted: string, rating: number, comment: string) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo para pasar una película/serie de "Viendo" a "Visto".
 * Pide fecha de fin (obligatoria), valoración 1-5 (obligatoria) y comentario opcional.
 */
export default function CompleteWatchingDialog({
  dateValue,
  ratingValue,
  commentValue,
  onSave,
  onClose,
  busy = false,
}: CompleteWatchingDialogProps) {
  const [draftDate, setDraftDate] = useState(dateValue ?? todayIso())
  const [draftRating, setDraftRating] = useState(ratingValue || 0)
  const [draftComment, setDraftComment] = useState(commentValue || '')
  const [dateError, setDateError] = useState<string | null>(null)
  const [ratingError, setRatingError] = useState<string | null>(null)

  function handleSave() {
    setDateError(null)
    setRatingError(null)

    const message = missingRequiredDate(draftDate, 'La fecha de fin')
    if (message) {
      setDateError(message)
      return
    }
    if (!draftRating || draftRating === 0) {
      setRatingError('La valoración es obligatoria.')
      return
    }

    onSave(draftDate, draftRating, draftComment.trim())
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Marcar como visto"
        className="modal w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-heading-sm mb-1">¡Vista!</h3>
        <p className="text-body text-graphite mb-5">La película/serie pasará a «Visto»</p>

        <label className="label" htmlFor="complete-watching-date">
          Fecha de fin <span className="text-brand">*</span>
        </label>
        <input
          id="complete-watching-date"
          className="input"
          type="date"
          value={draftDate}
          onChange={(e) => {
            setDraftDate(e.target.value)
            setDateError(null)
          }}
        />
        {dateError ? (
          <p className="text-caption text-red-600 mt-1" role="alert">{dateError}</p>
        ) : (
          <p className="text-caption text-stone mt-1">Por defecto, hoy.</p>
        )}

        <label className="label mt-4">Valoración <span className="text-brand">*</span></label>
        <div className="pt-2">
          <StarRating value={draftRating} onChange={(n) => { setDraftRating(n); setRatingError(null) }} />
        </div>
        {ratingError ? (
          <p className="text-caption text-red-600 mt-1" role="alert">{ratingError}</p>
        ) : (
          <p className="text-caption text-stone mt-1">Selecciona de 1 a 5 estrellas.</p>
        )}

        <label className="label mt-4" htmlFor="complete-watching-comment">
          Comentario
        </label>
        <textarea
          id="complete-watching-comment"
          className="input !h-auto !min-h-[80px] !py-3"
          value={draftComment}
          onChange={(e) => setDraftComment(e.target.value)}
          placeholder="Notas personales…"
        />

        <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={busy}>
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}