import { useState } from 'react'
import { createPortal } from 'react-dom'
import { missingRequiredDate, todayIso } from '../utils/dates'

export interface StartWatchingDialogProps {
  /** Fecha de inicio actual, si la tiene. */
  dateValue?: string
  onSave: (dateAdded: string) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo para pasar una película/serie de "Plan para ver" a "Viendo".
 * Pide la fecha de inicio (hoy por defecto, obligatoria).
 */
export default function StartWatchingDialog({
  dateValue,
  onSave,
  onClose,
  busy = false,
}: StartWatchingDialogProps) {
  const [draft, setDraft] = useState(dateValue ?? todayIso())
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const message = missingRequiredDate(draft, 'La fecha de inicio')
    if (message) {
      setError(message)
      return
    }
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
        aria-label="Empezar a ver"
        className="modal w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-heading-sm mb-1">¡A verla!</h3>
        <p className="text-body text-graphite mb-5">La película/serie pasará a «Viendo»</p>

        <label className="label" htmlFor="start-watching-date">
          Fecha de inicio <span className="text-brand">*</span>
        </label>
        <input
          id="start-watching-date"
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