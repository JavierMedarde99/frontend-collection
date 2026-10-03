import { useState } from 'react'
import { createPortal } from 'react-dom'
import { missingRequiredDate, todayIso } from '../utils/dates'

export interface GameStateDialogProps {
  /** Título del diálogo. */
  title: string
  /** Texto explicativo bajo el título. */
  description?: string
  /** Etiqueta de la fecha que se pide (p. ej. «Fecha de inicio»). */
  dateLabel: string
  /** Fecha actual del videojuego para esa fecha, si la tiene. */
  dateValue?: string
  onSave: (date: string) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo para cambiar de estado un videojuego pidiendo la fecha que el nuevo
 * estado exige (inicio al pasar a «Jugando», fin al pasar a «Completado»). La
 * fecha es obligatoria, por eso se propone la de hoy y no se puede vaciar.
 */
export default function GameStateDialog({
  title,
  description,
  dateLabel,
  dateValue,
  onSave,
  onClose,
  busy = false,
}: GameStateDialogProps) {
  const [draft, setDraft] = useState(dateValue ?? todayIso())
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const message = missingRequiredDate(draft, `La ${dateLabel.toLowerCase()}`)
    if (message) return setError(message)
    onSave(draft)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={description ? 'font-display text-heading-sm mb-1' : 'font-display text-heading-sm mb-5'}>
          {title}
        </h3>
        {description && <p className="text-body text-graphite mb-5">{description}</p>}

        <label className="label" htmlFor="game-state-date">
          {dateLabel} <span className="text-brand">*</span>
        </label>
        <input
          id="game-state-date"
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