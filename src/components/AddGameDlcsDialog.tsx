import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getGameAdditions } from '../api/gamesApi'
import { RequestError } from '../api/errors'
import { GAME_STATES } from '../constants/games'
import { GameStatus, type AddGameAdditionItem, type GameAddition } from '../types'
import Spinner from './Spinner'

/** Lote máximo de `POST /games/{id}/additions` (una página de adiciones de RAWG). */
const MAX_PER_REQUEST = 40
const RAWG_DOWN_MESSAGE = 'RAWG no responde, inténtalo en un momento.'
const EMPTY_MESSAGE = 'Este juego no tiene contenido adicional en RAWG.'

/** Fecha local de hoy en ISO (yyyy-mm-dd), como valor por defecto de las fechas. */
function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Estado y datos con los que nace una adición nueva. */
interface DlcDraft {
  status: GameStatus
  acquisitionDate: string
  price: string
  dateAdded: string
  dateCompleted: string
}

/** Por defecto en posesión, con las fechas propuestas hoy y el precio por rellenar. */
function newDraft(): DlcDraft {
  return {
    status: GameStatus.OWNED,
    acquisitionDate: todayISO(),
    price: '',
    dateAdded: todayISO(),
    dateCompleted: todayISO(),
  }
}

export interface AddGameDlcsDialogProps {
  /** Juego base (tuyo, fuera de WISHLIST) al que se añade el contenido. */
  baseId: string
  /** Recibe las adiciones seleccionadas con su estado y sus datos. */
  onSave: (items: AddGameAdditionItem[]) => void | Promise<void>
  onClose: () => void
  busy?: boolean
  /** Error devuelto por el backend al guardar; se muestra dentro del diálogo. */
  saveError?: string | null
}

/**
 * Diálogo de alta de contenido adicional desde el catálogo de RAWG. Clona el
 * patrón de `AddExpansionsDialog` (portal + onSave/onClose/busy): cada fila
 * elige su estado y, fuera de WISHLIST, su fecha de obtención y precio; en
 * PLAYING/COMPLETED pide además las fechas de seguimiento. Lo que ya tienes
 * suelto se puede seleccionar para vincularlo sin tocar sus datos. Un 502 de
 * RAWG se distingue de «no hay contenido adicional».
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
  const [drafts, setDrafts] = useState<Record<string, DlcDraft>>({})
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
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
        setDrafts({})
        setRowErrors({})
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
    setRowErrors(({ [externalId]: _gone, ...rest }) => rest)
    setSelected((prev) => {
      if (prev.includes(externalId)) return prev.filter((id) => id !== externalId)
      // Tope de lote: el backend rechaza más de 40 en una petición.
      if (prev.length >= MAX_PER_REQUEST) return prev
      return [...prev, externalId]
    })
    setDrafts((prev) => (prev[externalId] ? prev : { ...prev, [externalId]: newDraft() }))
  }

  function updateDraft(externalId: string, patch: Partial<DlcDraft>) {
    setRowErrors(({ [externalId]: _gone, ...rest }) => rest)
    setDrafts((prev) => ({
      ...prev,
      [externalId]: { ...(prev[externalId] ?? newDraft()), ...patch },
    }))
  }

  /**
   * Valida en cliente lo que el backend exige para las adiciones nuevas antes
   * de enviar: un fallo se señala bajo su fila y no se hace la llamada. Lo que
   * ya está en la colección solo se enlaza y no pide datos.
   */
  function handleSave() {
    const errors: Record<string, string> = {}
    const items: AddGameAdditionItem[] = []
    for (const externalId of selected) {
      const addition = additions?.find((candidate) => candidate.externalId === externalId)
      if (!addition) continue
      if (addition.inCollection) {
        items.push({ externalId, status: GameStatus.OWNED, link: true })
        continue
      }
      const draft = drafts[externalId] ?? newDraft()
      if (draft.status === GameStatus.WISHLIST) {
        items.push({ externalId, status: GameStatus.WISHLIST })
        continue
      }
      if (draft.acquisitionDate === '') {
        errors[externalId] = 'La fecha de obtención es obligatoria.'
        continue
      }
      const price = draft.price.trim()
      const value = Number(price)
      if (price === '') {
        errors[externalId] = 'El precio de adquisición es obligatorio.'
        continue
      }
      if (Number.isNaN(value) || value < 0) {
        errors[externalId] = 'El precio debe ser un número mayor o igual que 0.'
        continue
      }
      if (
        (draft.status === GameStatus.PLAYING || draft.status === GameStatus.COMPLETED) &&
        draft.dateAdded === ''
      ) {
        errors[externalId] = 'La fecha de inicio es obligatoria.'
        continue
      }
      if (draft.status === GameStatus.COMPLETED && draft.dateCompleted === '') {
        errors[externalId] = 'La fecha de fin es obligatoria.'
        continue
      }
      items.push({
        externalId,
        status: draft.status,
        acquisitionDate: draft.acquisitionDate,
        acquisitionPrice: value,
        ...(draft.status === GameStatus.PLAYING || draft.status === GameStatus.COMPLETED
          ? { dateAdded: draft.dateAdded }
          : {}),
        ...(draft.status === GameStatus.COMPLETED ? { dateCompleted: draft.dateCompleted } : {}),
      })
    }
    setRowErrors(errors)
    if (Object.keys(errors).length > 0) return
    onSave(items)
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
                const draft = drafts[addition.externalId] ?? newDraft()
                const rowError = rowErrors[addition.externalId]
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

                    {!addition.inCollection && isSelected && (
                      <div className="flex w-full flex-wrap items-center gap-2 pl-7">
                        <select
                          className="input !py-1 !text-body w-auto"
                          aria-label={`Estado de ${addition.title}`}
                          value={draft.status}
                          onChange={(e) =>
                            updateDraft(addition.externalId, { status: e.target.value as GameStatus })
                          }
                        >
                          {Object.entries(GAME_STATES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                        {draft.status !== GameStatus.WISHLIST && (
                          <>
                            <input
                              aria-label={`Fecha de obtención de ${addition.title}`}
                              type="date"
                              className="input !py-1 w-36"
                              value={draft.acquisitionDate}
                              onChange={(e) =>
                                updateDraft(addition.externalId, { acquisitionDate: e.target.value })
                              }
                            />
                            <input
                              aria-label={`Precio de ${addition.title}`}
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Precio (€)"
                              className="input !py-1 w-28"
                              value={draft.price}
                              onChange={(e) => updateDraft(addition.externalId, { price: e.target.value })}
                            />
                          </>
                        )}
                        {(draft.status === GameStatus.PLAYING || draft.status === GameStatus.COMPLETED) && (
                          <input
                            aria-label={`Fecha de inicio de ${addition.title}`}
                            type="date"
                            className="input !py-1 w-36"
                            value={draft.dateAdded}
                            onChange={(e) =>
                              updateDraft(addition.externalId, { dateAdded: e.target.value })
                            }
                          />
                        )}
                        {draft.status === GameStatus.COMPLETED && (
                          <input
                            aria-label={`Fecha de fin de ${addition.title}`}
                            type="date"
                            className="input !py-1 w-36"
                            value={draft.dateCompleted}
                            onChange={(e) =>
                              updateDraft(addition.externalId, { dateCompleted: e.target.value })
                            }
                          />
                        )}
                      </div>
                    )}
                    {rowError && (
                      <p role="alert" className="w-full pl-7 text-caption text-red-600">
                        {rowError}
                      </p>
                    )}
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
            onClick={handleSave}
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
