import { useState } from 'react'

export interface MarkAsOwnedDialogProps {
  /** Fecha de obtención actual del libro, si la tiene. */
  acquisitionDate?: string
  onSave: (acquisitionDate: string | undefined) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Diálogo para pasar un libro de WISHLIST a TO_READ. Al confirmar guarda la
 * fecha de obtención: en la lista de deseos el libro aún no estaba en casa.
 */
export default function MarkAsOwnedDialog({ acquisitionDate, onSave, onClose, busy = false }: MarkAsOwnedDialogProps) {
  const [draft, setDraft] = useState(acquisitionDate ?? today())

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
          Fecha de obtención
        </label>
        <input
          id="mark-owned-date"
          className="input"
          type="date"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <p className="text-caption text-stone mt-1">Opcional. Se deja vacía si no la recuerdas.</p>

        <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSave(draft || undefined)}
            disabled={busy}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
