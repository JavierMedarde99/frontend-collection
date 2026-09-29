import { useState } from 'react'
import { missingRequiredDate, todayIso } from '../utils/dates'

export interface AcquisitionGameDialogProps {
  /** Fecha de obtención actual del videojuego, si la tiene. */
  acquisitionDate?: string
  /** Precio de adquisición actual del videojuego, si lo tiene. */
  acquisitionPrice?: number
  onSave: (acquisitionDate: string, acquisitionPrice: number) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo para pasar un videojuego de WISHLIST a OWNED. Al confirmar guarda la
 * fecha de obtención y el precio de adquisición. La fecha es obligatoria (se
 * propone la de hoy y no se puede vaciar) y el precio también.
 */
export default function AcquisitionGameDialog({
  acquisitionDate,
  acquisitionPrice,
  onSave,
  onClose,
  busy = false,
}: AcquisitionGameDialogProps) {
  const [draft, setDraft] = useState(acquisitionDate ?? todayIso())
  const [priceDraft, setPriceDraft] = useState(acquisitionPrice !== undefined ? String(acquisitionPrice) : '')
  const [dateError, setDateError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)

  function handleSave() {
    const message = missingRequiredDate(draft, 'La fecha de obtención')
    if (message) {
      setDateError(message)
      setPriceError(null)
      return
    }
    if (priceDraft.trim() === '') {
      setPriceError('El precio es obligatorio.')
      setDateError(null)
      return
    }
    onSave(draft, Number(priceDraft))
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
        <h3 className="font-display text-heading-sm mb-1">Ya está en tu colección</h3>
        <p className="text-body text-graphite mb-5">El videojuego pasará a «En posesión»</p>

        <label className="label" htmlFor="acquire-game-date">
          Fecha de obtención <span className="text-brand">*</span>
        </label>
        <input
          id="acquire-game-date"
          className="input"
          type="date"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setDateError(null)
          }}
        />
        {dateError ? (
          <p className="text-caption text-red-600 mt-1" role="alert">{dateError}</p>
        ) : (
          <p className="text-caption text-stone mt-1">Por defecto, hoy.</p>
        )}

        <label className="label mt-4" htmlFor="acquire-game-price">
          Precio de adquisición <span className="text-brand">*</span>
        </label>
        <input
          id="acquire-game-price"
          className="input"
          type="number"
          min="0"
          step="0.01"
          value={priceDraft}
          onChange={(e) => {
            setPriceDraft(e.target.value)
            setPriceError(null)
          }}
          placeholder="24.99"
        />
        {priceError ? (
          <p className="text-caption text-red-600 mt-1" role="alert">{priceError}</p>
        ) : (
          <p className="text-caption text-stone mt-1">Cuánto te costó conseguirla.</p>
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