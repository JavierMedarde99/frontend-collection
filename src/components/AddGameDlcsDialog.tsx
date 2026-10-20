import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getGameAdditions } from '../api/gamesApi'
import { RequestError } from '../api/errors'
import { GAME_STATES } from '../constants/games'
import { GameStatus, type GameAddition } from '../types'
import Spinner from './Spinner'

/** Lote máximo de `POST /games/{id}/additions` (una página de adiciones de RAWG). */
const MAX_PER_REQUEST = 40
const RAWG_DOWN_MESSAGE = 'RAWG no responde, inténtalo en un momento.'
const EMPTY_MESSAGE = 'Este juego no tiene contenido adicional en RAWG.'

export interface AddGameDlcsDialogProps {
  /** Juego base (tuyo, fuera de WISHLIST) al que se añade el contenido. */
  baseId: string
  /** Recibe los externalId seleccionados y el estado común con el que nacen. */
  onSave: (externalIds: string[], status: GameStatus) => void | Promise<void>
  onClose: () => void
  busy?: boolean
  /** Error devuelto por el backend al guardar; se muestra dentro del diálogo. */
  saveError?: string | null
}

/**
 * Diálogo de alta de contenido adicional desde el catálogo de RAWG. Clona el
 * patrón de `AddExpansionsDialog` (portal + onSave/onClose/busy) con dos
 * diferencias: el estado se elige una vez para todo el lote y lo que ya tienes
 * suelto se puede seleccionar para vincularlo al base. Un 502 de RAWG se
 * distingue de «no hay contenido adicional».
 */
export default function AddGameDlcsDialog({
  baseId,
  onSave,
  onClose,
  busy = false,
  saveError = null,
}: AddGameDlcsDialogProps) {
  const [additions, setAdditions] = useState<GameAddition[] | null>(null)
  const [totalAvailable, setTotalAvailable] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [status, setStatus] = useState<GameStatus>(GameStatus.OWNED)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    getGameAdditions(baseId)
      .then((data) => {
        if (cancelled) return
        setAdditions(data.additions)
        setTotalAvailable(data.totalAvailable)
        setSelected([])
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setAdditions(null)
        if (err instanceof RequestError && err.status === 502) {
          setLoadError(RAWG_DOWN_MESSAGE)
        } else {
          setLoadError(err instanceof Error ? err.message : 'No se pudo cargar el contenido adicional.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [baseId, attempt])

  function toggle(externalId: string) {
    setSelected((prev) => {
      if (prev.includes(externalId)) return prev.filter((id) => id !== externalId)
      // Tope de lote: el backend rechaza más de 40 en una petición.
      if (prev.length >= MAX_PER_REQUEST) return prev
      return [...prev, externalId]
    })
  }

  const atCap = selected.length >= MAX_PER_REQUEST
  const saveDisabled = busy || loading || loadError !== null || selected.length === 0

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Añadir contenido adicional"
        className="modal w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-heading-sm mb-1">Añadir contenido adicional</h3>
        <p className="text-body text-graphite mb-5">
          Contenido adicional que RAWG conoce de este juego. Incluye DLCs, ediciones y apps
          compañeras; las que ya tienes aparecen marcadas.
        </p>

        {loading ? (
          <Spinner label="Cargando contenido adicional…" />
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-body text-red-600" role="alert">{loadError}</p>
            <button type="button" className="btn-ghost !px-4 !py-2" onClick={() => setAttempt((a) => a + 1)}>
              Reintentar
            </button>
          </div>
        ) : !additions || additions.length === 0 ? (
          <p className="text-body text-graphite" role="status">{EMPTY_MESSAGE}</p>
        ) : (
          <>
            <ul className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto pr-1">
              {additions.map((addition) => {
                const isSelected = selected.includes(addition.externalId)
                const checked = addition.alreadyLinked || isSelected
                const disabled = addition.alreadyLinked || (!isSelected && atCap)
                return (
                  <li
                    key={addition.externalId}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-silver/60 px-3 py-2"
                  >
                    <input
                      id={`dlc-${addition.externalId}`}
                      type="checkbox"
                      className="w-4 h-4 shrink-0 accent-[var(--c,#8f3a1e)]"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(addition.externalId)}
                    />
                    <label
                      htmlFor={`dlc-${addition.externalId}`}
                      className={`flex-1 text-body ${addition.alreadyLinked ? 'text-stone line-through' : 'text-ink'}`}
                    >
                      {addition.title}
                    </label>
                    {addition.alreadyLinked ? (
                      <span className="text-caption text-graphite shrink-0">Ya vinculado</span>
                    ) : addition.inCollection ? (
                      <span className="text-caption text-graphite shrink-0">Ya en tu colección (se vinculará)</span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
            {atCap && <p className="text-caption text-stone mt-2">Máximo 40 adiciones por petición.</p>}
            {totalAvailable > additions.length && (
              <p className="text-caption text-stone mt-2">
                RAWG lista {totalAvailable} adiciones; se muestran las primeras {additions.length}.
              </p>
            )}

            <div className="mt-4">
              <label htmlFor="dlc-status" className="label">Estado de las seleccionadas</label>
              <select
                id="dlc-status"
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value as GameStatus)}
              >
                {Object.entries(GAME_STATES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <p className="text-caption text-graphite mt-1">
                Se aplicará a todo el contenido que añadas en esta petición.
              </p>
            </div>
          </>
        )}

        {saveError && <p role="alert" className="text-body text-red-600 mt-4">{saveError}</p>}

        <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSave(selected, status)}
            disabled={saveDisabled}
          >
            Añadir {selected.length} seleccionada{selected.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
