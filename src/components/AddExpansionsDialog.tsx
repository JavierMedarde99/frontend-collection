import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getExpansions } from '../api/boardgamesApi'
import { RequestError } from '../api/errors'
import Spinner from './Spinner'
import ListSearchInput from './ListSearchInput'
import { BoardGameStatus, type AddExpansionItem, type BoardGameExpansion } from '../types'

/** Lote máximo de `POST /boardgames/{id}/expansions` (el límite de `/thing` en BGG). */
const MAX_PER_REQUEST = 20
/** Con más filas que esto, la lista lleva buscador. */
const SEARCH_THRESHOLD = 5
const BGG_DOWN_MESSAGE = 'BGG no responde, inténtalo en un momento.'
const EMPTY_MESSAGE = 'Este juego no tiene expansiones en BGG.'

/** Fecha local de hoy en ISO (yyyy-mm-dd), como valor por defecto de fecha de adición. */
function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Estado y datos de adquisición elegidos para una expansión nueva. */
interface ExpansionDraft {
  status: BoardGameStatus
  price: string
  dateAdded: string
}

/** Por defecto en posesión (el comportamiento de siempre), precio a rellenar y fecha de hoy. */
function newDraft(): ExpansionDraft {
  return { status: BoardGameStatus.OWNED, price: '', dateAdded: todayISO() }
}

export interface AddExpansionsDialogProps {
  /** Juego base (tuyo, en OWNED) al que se añaden las expansiones. */
  baseId: string
  /** Recibe solo las nuevas seleccionadas, cada una con su estado y datos; las que ya tienes no se envían. */
  onSave: (expansions: AddExpansionItem[]) => void | Promise<void>
  onClose: () => void
  busy?: boolean
  /** Error devuelto por el backend al guardar; se muestra dentro del diálogo. */
  saveError?: string | null
}

/**
 * Diálogo de alta de expansiones desde el catálogo de BGG. Clona el patrón de
 * `AcquireBoardGameDialog` (portal + onSave/onClose/busy) pero carga su propia
 * lista: cada expansión nueva elige estado por fila (deseada o en posesión, con
 * precio y fecha si es en posesión), las que ya están en la colección aparecen
 * marcadas y deshabilitadas, y un 502 de BGG se distingue de «no hay expansiones».
 */
export default function AddExpansionsDialog({
  baseId,
  onSave,
  onClose,
  busy = false,
  saveError = null,
}: AddExpansionsDialogProps) {
  const [expansions, setExpansions] = useState<BoardGameExpansion[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [drafts, setDrafts] = useState<Record<string, ExpansionDraft>>({})
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [attempt, setAttempt] = useState(0)
  const [filter, setFilter] = useState('')

  // El buscador filtra solo las filas visibles: `selected` y `drafts` no se tocan,
  // así que se puede marcar, cambiar el filtro y marcar otra sin perder nada.
  const visible = useMemo(() => {
    if (!expansions) return null
    const q = filter.trim().toLowerCase()
    return q === '' ? expansions : expansions.filter((exp) => exp.title.toLowerCase().includes(q))
  }, [expansions, filter])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    getExpansions(baseId)
      .then((data) => {
        if (cancelled) return
        setExpansions(data.expansions)
        setSelected([])
        setRowErrors({})
        setDrafts(
          Object.fromEntries(data.expansions.filter((exp) => !exp.inCollection).map((exp) => [exp.bggId, newDraft()])),
        )
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setExpansions(null)
        if (err instanceof RequestError && err.status === 502) {
          setLoadError(BGG_DOWN_MESSAGE)
        } else {
          setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar las expansiones.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [baseId, attempt])

  function toggle(bggId: string) {
    setRowErrors(({ [bggId]: _gone, ...rest }) => rest)
    setSelected((prev) => {
      if (prev.includes(bggId)) return prev.filter((id) => id !== bggId)
      // Tope de lote: no se pueden pedir más de 20 a BGG de una vez.
      if (prev.length >= MAX_PER_REQUEST) return prev
      return [...prev, bggId]
    })
  }

  function updateDraft(bggId: string, patch: Partial<ExpansionDraft>) {
    setRowErrors(({ [bggId]: _gone, ...rest }) => rest)
    setDrafts((prev) => ({ ...prev, [bggId]: { ...(prev[bggId] ?? newDraft()), ...patch } }))
  }

  /**
   * Valida en cliente lo que el backend exige (precio y fecha en posesión) antes
   * de enviar: un fallo se señala bajo su fila y no se hace la llamada.
   */
  function handleSave() {
    const errors: Record<string, string> = {}
    const items: AddExpansionItem[] = []
    for (const bggId of selected) {
      const draft = drafts[bggId] ?? newDraft()
      if (draft.status !== BoardGameStatus.OWNED) {
        items.push({ bggId, status: BoardGameStatus.WISHLIST })
        continue
      }
      const price = draft.price.trim()
      const value = Number(price)
      if (price === '') {
        errors[bggId] = 'El precio de adquisición es obligatorio en posesión.'
        continue
      }
      if (Number.isNaN(value) || value < 0) {
        errors[bggId] = 'El precio debe ser un número mayor o igual que 0.'
        continue
      }
      if (draft.dateAdded === '') {
        errors[bggId] = 'La fecha de adición es obligatoria en posesión.'
        continue
      }
      items.push({ bggId, status: BoardGameStatus.OWNED, acquisitionPrice: value, dateAdded: draft.dateAdded })
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
        aria-label="Añadir expansiones"
        className="modal w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-heading-sm mb-1">Añadir expansiones</h3>
        <p className="text-body text-graphite mb-5">
          Expansiones que BGG conoce de este juego. Las que ya tienes aparecen marcadas.
        </p>

        {loading ? (
          <Spinner label="Cargando expansiones…" />
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-body text-red-600" role="alert">{loadError}</p>
            <button type="button" className="btn-ghost !px-4 !py-2" onClick={() => setAttempt((a) => a + 1)}>
              Reintentar
            </button>
          </div>
        ) : !expansions || expansions.length === 0 ? (
          <p className="text-body text-graphite" role="status">{EMPTY_MESSAGE}</p>
        ) : (
          <>
            {expansions.length > SEARCH_THRESHOLD && (
              <ListSearchInput
                value={filter}
                onChange={setFilter}
                count={visible?.length ?? 0}
                total={expansions.length}
                placeholder="Buscar expansión…"
                ariaLabel="Buscar expansiones"
              />
            )}
            <ul className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto pr-1">
              {visible?.map((exp) => {
                const isSelected = selected.includes(exp.bggId)
                const checked = exp.inCollection || isSelected
                const disabled = exp.inCollection || (!isSelected && atCap)
                const draft = drafts[exp.bggId] ?? newDraft()
                const rowError = rowErrors[exp.bggId]
                return (
                  <li
                    key={exp.bggId}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-silver/60 px-3 py-2"
                  >
                    <input
                      id={`exp-${exp.bggId}`}
                      type="checkbox"
                      className="w-4 h-4 shrink-0 accent-[var(--c,#8f3a1e)]"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(exp.bggId)}
                    />
                    <label htmlFor={`exp-${exp.bggId}`} className={`flex-1 text-body ${exp.inCollection ? 'text-stone line-through' : 'text-ink'}`}>
                      {exp.title}
                    </label>
                    {exp.inCollection && <span className="text-caption text-graphite shrink-0">Ya en tu colección</span>}

                    {!exp.inCollection && isSelected && (
                      <div className="flex w-full flex-wrap items-center gap-2 pl-7">
                        <select
                          className="input !py-1 !text-body w-auto"
                          aria-label={`Estado de ${exp.title}`}
                          value={draft.status}
                          onChange={(e) => updateDraft(exp.bggId, { status: e.target.value as BoardGameStatus })}
                        >
                          <option value={BoardGameStatus.OWNED}>En posesión</option>
                          <option value={BoardGameStatus.WISHLIST}>Deseada</option>
                        </select>
                        {draft.status === BoardGameStatus.OWNED && (
                          <>
                            <input
                              aria-label={`Precio de ${exp.title}`}
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Precio (€)"
                              className="input !py-1 w-28"
                              value={draft.price}
                              onChange={(e) => updateDraft(exp.bggId, { price: e.target.value })}
                            />
                            <input
                              aria-label={`Fecha de adición de ${exp.title}`}
                              type="date"
                              className="input !py-1 w-36"
                              value={draft.dateAdded}
                              onChange={(e) => updateDraft(exp.bggId, { dateAdded: e.target.value })}
                            />
                          </>
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
            {atCap && <p className="text-caption text-stone mt-2">Máximo 20 expansiones por petición.</p>}
          </>
        )}

        {saveError && <p role="alert" className="text-body text-red-600 mt-4">{saveError}</p>}

        <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saveDisabled}>
            Añadir {selected.length} seleccionada{selected.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
