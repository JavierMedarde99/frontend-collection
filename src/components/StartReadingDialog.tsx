import { useState } from 'react'

export interface StartReadingDialogProps {
  /** Total de páginas del libro. Si falta, se acepta cualquier valor. */
  pages: number | undefined
  onSave: (pagesRead: number) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo para pasar un libro de TO_READ a READING indicando las páginas
 * leídas. Es complementario a la barra de progreso, que solo aparece cuando
 * el libro ya está en READING.
 */
export default function StartReadingDialog({ pages, onSave, onClose, busy = false }: StartReadingDialogProps) {
  const [draft, setDraft] = useState('0')

  const value = draft === '' ? NaN : Number(draft)
  const invalid = Number.isNaN(value) || value < 0
  const exceeds = pages !== undefined && draft !== '' && value > pages

  function handleSave() {
    if (invalid || exceeds) return
    onSave(value)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Empezar a leer"
        className="modal w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-heading-sm mb-1">Empezar a leer</h3>
        {pages !== undefined && <p className="text-body text-graphite mb-5">De {pages} páginas en total</p>}

        <label className="label" htmlFor="start-reading-input">
          Nº de páginas leídas
        </label>
        <input
          id="start-reading-input"
          className="input"
          type="number"
          min="0"
          max={pages}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        {exceeds && <p className="text-caption text-red-600 mt-1">No puede exceder el total de páginas</p>}

        <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={invalid || exceeds || busy}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
