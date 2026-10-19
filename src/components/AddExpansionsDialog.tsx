import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getExpansions } from '../api/boardgamesApi'
import { RequestError } from '../api/errors'
import Spinner from './Spinner'
import type { BoardGameExpansion } from '../types'

/** Lote máximo de `POST /boardgames/{id}/expansions` (el límite de `/thing` en BGG). */
const MAX_PER_REQUEST = 20
const BGG_DOWN_MESSAGE = 'BGG no responde, inténtalo en un momento.'
const EMPTY_MESSAGE = 'Este juego no tiene expansiones en BGG.'

export interface AddExpansionsDialogProps {
  /** Juego base (tuyo, en OWNED) al que se añaden las expansiones. */
  baseId: string
  /** Recibe solo los bggIds nuevos seleccionados; las que ya tienes no se envían. */
  onSave: (bggIds: string[]) => void | Promise<void>
  onClose: () => void
  busy?: boolean
}

/**
 * Diálogo de alta masiva de expansiones desde el catálogo de BGG. Clona el
 * patrón de `AcquireBoardGameDialog` (portal + onSave/onClose/busy) pero carga
 * su propia lista: las que ya están en la colección aparecen marcadas y
 * deshabilitadas, y un 502 de BGG se distingue de «no hay expansiones».
 */
export default function AddExpansionsDialog({ baseId, onSave, onClose, busy = false }: AddExpansionsDialogProps) {
  const [expansions, setExpansions] = useState<BoardGameExpansion[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    getExpansions(baseId)
      .then((data) => {
        if (cancelled) return
        setExpansions(data.expansions)
        setSelected([])
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
    setSelected((prev) => {
      if (prev.includes(bggId)) return prev.filter((id) => id !== bggId)
      // Tope de lote: no se pueden pedir más de 20 a BGG de una vez.
      if (prev.length >= MAX_PER_REQUEST) return prev
      return [...prev, bggId]
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
            <ul className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto pr-1">
              {expansions.map((exp) => {
                const isSelected = selected.includes(exp.bggId)
                const checked = exp.inCollection || isSelected
                const disabled = exp.inCollection || (!isSelected && atCap)
                return (
                  <li
                    key={exp.bggId}
                    className="flex items-center gap-3 rounded-lg border border-silver/60 px-3 py-2"
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
                  </li>
                )
              })}
            </ul>
            {atCap && <p className="text-caption text-stone mt-2">Máximo 20 expansiones por petición.</p>}
          </>
        )}

        <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={() => onSave([...selected])} disabled={saveDisabled}>
            Añadir {selected.length} seleccionada{selected.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
