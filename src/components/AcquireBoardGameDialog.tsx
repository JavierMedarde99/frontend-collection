import { useState } from 'react'
import { BOARD_GAME_DIFFICULTY_OPTIONS } from '../constants/boardGames'
import { BoardGameDifficulty } from '../types'
import { missingRequiredDate, todayIso } from '../utils/dates'
import StarRating from './StarRating'

export interface AcquireBoardGameDialogProps {
  /** Fecha de adición actual del juego, si la tiene. */
  dateAdded?: string
  /** Precio de adquisición actual del juego, si lo tiene. */
  acquisitionPrice?: number
  /** Dificultad actual del juego, si la tiene. */
  difficulty?: BoardGameDifficulty | ''
  /** Valoración personal actual (1–5), si la tiene. */
  personalRating?: number
  /** Comentario actual del juego, si lo tiene. */
  notes?: string
  /** Número de jugadas actual, si lo tiene. */
  playCount?: number
  /** Última jugada actual, si la tiene. */
  lastPlayedDate?: string
  onSave: (payload: {
    dateAdded: string
    acquisitionPrice: number
    difficulty?: BoardGameDifficulty
    personalRating?: number
    notes?: string
    playCount?: number
    lastPlayedDate?: string
  }) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo para pasar un juego de mesa de WISHLIST a OWNED.
 * Muestra el bloque completo de campos «En propiedad»: fecha de adición (hoy por defecto),
 * precio obligatorio, dificultad, valoración, comentario, jugadas y última jugada.
 */
export default function AcquireBoardGameDialog({
  dateAdded,
  acquisitionPrice,
  difficulty,
  personalRating,
  notes,
  playCount,
  lastPlayedDate,
  onSave,
  onClose,
  busy = false,
}: AcquireBoardGameDialogProps) {
  const [draftDate, setDraftDate] = useState(dateAdded ?? todayIso())
  const [priceDraft, setPriceDraft] = useState(acquisitionPrice !== undefined ? String(acquisitionPrice) : '')
  const [draftDifficulty, setDraftDifficulty] = useState<BoardGameDifficulty | ''>(difficulty || '')
  const [draftRating, setDraftRating] = useState(personalRating || 0)
  const [draftNotes, setDraftNotes] = useState(notes || '')
  const [draftPlayCount, setDraftPlayCount] = useState(playCount !== undefined ? String(playCount) : '')
  const [draftLastPlayed, setDraftLastPlayed] = useState(lastPlayedDate || '')
  const [dateError, setDateError] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [lastPlayedError, setLastPlayedError] = useState<string | null>(null)

  function handleSave() {
    setDateError(null)
    setPriceError(null)
    setLastPlayedError(null)

    const message = missingRequiredDate(draftDate, 'La fecha de adición')
    if (message) {
      setDateError(message)
      return
    }
    if (priceDraft.trim() === '') {
      setPriceError('El precio de adquisición es obligatorio.')
      return
    }
    const playCountNum = Number(draftPlayCount)
    if (!Number.isNaN(playCountNum) && playCountNum > 0) {
      const lastError = missingRequiredDate(draftLastPlayed, 'La fecha de la última jugada')
      if (lastError) {
        setLastPlayedError(lastError)
        return
      }
    }

    onSave({
      dateAdded: draftDate,
      acquisitionPrice: Number(priceDraft),
      difficulty: draftDifficulty || undefined,
      personalRating: draftRating > 0 ? draftRating : undefined,
      notes: draftNotes.trim() || undefined,
      playCount: !Number.isNaN(playCountNum) ? playCountNum : undefined,
      lastPlayedDate: draftLastPlayed || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Marcar como en propiedad"
        className="modal w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-heading-sm mb-1">Añadir a tu colección</h3>
        <p className="text-body text-graphite mb-5">El juego de mesa pasará a «En propiedad»</p>

        <div className="flex flex-col gap-4">
          <label className="label" htmlFor="acquire-bg-date">
            Fecha de adición <span className="text-brand">*</span>
          </label>
          <input
            id="acquire-bg-date"
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

          <label className="label" htmlFor="acquire-bg-price">
            Precio de adquisición <span className="text-brand">*</span>
          </label>
          <input
            id="acquire-bg-price"
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
            <p className="text-caption text-stone mt-1">Cuánto te costó conseguirlo.</p>
          )}

          <label className="label" htmlFor="acquire-bg-difficulty">
            Dificultad percibida
          </label>
          <select
            id="acquire-bg-difficulty"
            className="input"
            value={draftDifficulty}
            onChange={(e) => setDraftDifficulty(e.target.value as BoardGameDifficulty | '')}
          >
            <option value="">Sin especificar</option>
            {BOARD_GAME_DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <label className="label">Valoración personal</label>
          <div className="pt-2">
            <StarRating value={draftRating} onChange={setDraftRating} />
          </div>

          <label className="label" htmlFor="acquire-bg-notes">
            Comentario
          </label>
          <textarea
            id="acquire-bg-notes"
            className="input !h-auto !min-h-[80px] !py-3"
            value={draftNotes}
            onChange={(e) => setDraftNotes(e.target.value)}
            placeholder="Comentario personal…"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="label" htmlFor="acquire-bg-plays">
              Número de jugadas
            </label>
            <input
              id="acquire-bg-plays"
              className="input"
              type="number"
              min="0"
              value={draftPlayCount}
              onChange={(e) => setDraftPlayCount(e.target.value)}
              placeholder="Ej: 12"
            />
            <label className="label" htmlFor="acquire-bg-last">
              Última jugada
            </label>
            <input
              id="acquire-bg-last"
              className="input"
              type="date"
              value={draftLastPlayed}
              onChange={(e) => {
                setDraftLastPlayed(e.target.value)
                setLastPlayedError(null)
              }}
            />
            {lastPlayedError ? (
              <p className="text-caption text-red-600 mt-1 sm:col-span-2" role="alert">{lastPlayedError}</p>
            ) : (
              <p className="text-caption text-stone mt-1 sm:col-span-2">Obligatoria si has jugado al menos una vez.</p>
            )}
          </div>
        </div>

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