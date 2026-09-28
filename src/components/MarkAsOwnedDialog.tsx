import { useState } from 'react'
import { missingRequiredDate, todayIso } from '../utils/dates'

export interface MarkAsOwnedDialogProps {
  /** Fecha de obtención actual del libro, si la tiene. */
  acquisitionDate?: string
  onSave: (acquisitionDate: string) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo para pasar un libro de WISHLIST a TO_READ. Al confirmar guarda la
 * fecha de obtención: en la lista de deseos el libro aún no estaba en casa.
 * La fecha es obligatoria, por eso se propone la de hoy y no se puede vaciar.
 */
export default function MarkAsOwnedDialog({ acquisitionDate, onSave, onClose, busy = false }: MarkAsOwnedDialogProps) {
  const [draft, setDraft] = useState(acquisitionDate ?? todayIso())
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const message = missingRequiredDate(draft, 'La fecha de obtención')
    if (message) return setError(message)
    onSave(draft)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Marcar como en posesión"
        className="modal w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-heading-sm mb-1">Ya está en tu poder</h3>
        <p className="text-body text-graphite mb-5">El libro pasará a «Por leer»</p>

        <label className="label" htmlFor="mark-owned-date">
          Fecha de obtención <span className="text-brand">*</span>
        </label>
        <input
          id="mark-owned-date"
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
    </div>
  )
}
