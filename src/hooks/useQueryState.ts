import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Estado sincronizado con un query param de la URL (replace, sin
 * ensuciar el historial). Al recargar o compartir el enlace se
 * restauran los filtros. El valor inicial no se escribe en la URL.
 */
export function useQueryState<T extends string>(key: string, initial: T): [T, (value: T) => void] {
  const [params, setParams] = useSearchParams()

  const raw = params.get(key)
  const value = (raw ?? initial) as T

  const setValue = useCallback(
    (next: T) => {
      setParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (next === initial || next === '') {
            nextParams.delete(key)
          } else {
            nextParams.set(key, next)
          }
          return nextParams
        },
        { replace: true },
      )
    },
    [key, initial, setParams],
  )

  return [value, setValue]
}

/** Página (0-based) sincronizada con ?page=. */
export function useQueryPage(): [number, (page: number) => void] {
  const [params, setParams] = useSearchParams()
  const raw = params.get('page')
  const parsed = raw !== null ? Number.parseInt(raw, 10) : 0
  const page = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed

  const setPage = useCallback(
    (next: number) => {
      const safe = Math.max(0, next)
      setParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (safe === 0) {
            nextParams.delete('page')
          } else {
            nextParams.set('page', String(safe))
          }
          return nextParams
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return [page, setPage]
}
