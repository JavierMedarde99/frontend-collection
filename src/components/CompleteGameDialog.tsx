import { useState } from 'react'
import StarRating from './StarRating'
import { missingRequiredDate, todayIso } from '../utils/dates'

export interface CompleteGameDialogProps {
  /** Fecha de fin actual del videojuego, si la tiene. */
  dateValue?: string
  /** Valoración actual, si la tiene. */
  ratingValue?: number
  /** Comentario actual, si lo tiene. */
  commentValue?: string
  onSave: (date: string, rating: number, comment: string) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo para pasar un videojuego de PLAYING a COMPLETED. Pide la fecha de fin
 * (obligatoria, hoy por defecto) y, de forma opcional, valoración y comentario.
 */
export default function CompleteGameDialog({
  dateValue,
  ratingValue = 0,
  commentValue = '',
  onSave,
  onClose,
  busy = false,
}: CompleteGameDialogProps) {
  const [draft, setDraft] = useState(dateValue ?? todayIso())
  const [rating, setRating] = useState(ratingValue ?? 0)
  const [comment, setComment] = useState(commentValue ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const message = missingRequiredDate(draft, 'La fecha de fin')
    if (message) return setError(message)
    onSave(draft, rating, comment)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Marcar como completado"
        className="modal w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-heading-sm mb-1">Lo has terminado</h3>
        <p className="text-body text-graphite mb-5">El videojuego pasará a «Completado»</p>

        <label className="label" htmlFor="complete-game-date">
          Fecha de fin <span className="text-brand">*</span>
        </label>
        <input
          id="complete-game-date"
          className="input"
          type="date"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setError(null)
          }}
        />
        {error ? (
          <p className="text-caption text-red-600 mt-1" role="alert">{error}</p>
        ) : (
          <p className="text-caption text-stone mt-1">Por defecto, hoy.</p>
        )}

        <span className="label mt-4">Valoración</span>
        <StarRating value={rating} onChange={setRating} />

        <label className="label mt-4" htmlFor="complete-game-comment">
          Comentario
        </label>
        <textarea
          id="complete-game-comment"
          className="input"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tu opinión…"
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
    </div>
  )
}