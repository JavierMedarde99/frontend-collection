import { useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Filtros/página/orden sincronizados con la query de la URL en un
 * único setParams por actualización. (Varios setParams seguidos se
 * pisan entre sí porque React Router los resuelve contra el snapshot
 * rancio del render, por eso los filtros deben ir en un solo objeto.)
 *
 * Los valores iniciales no se escriben en la URL.
 */
export function useListQuery<T extends Record<string, string | number | string[]>>(initial: T) {
  const [params, setParams] = useSearchParams()
  const initialRef = useRef(initial)
  initialRef.current = initial

  const values = { ...initial } as T
  for (const key of Object.keys(initial)) {
    if (Array.isArray(initial[key])) {
      const all = params.getAll(key)
      if (all.length > 0) (values as Record<string, string | number | string[]>)[key] = all
      continue
    }
    const raw = params.get(key)
    if (raw === null) continue
    ;(values as Record<string, string | number | string[]>)[key] =
      key === 'page' ? Math.max(0, Number.parseInt(raw, 10) || 0) : raw
  }

  const setQuery = useCallback(
    (patch: Partial<T>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const defaults = initialRef.current as Record<string, string | number | string[]>
          for (const [key, value] of Object.entries(patch)) {
            const def = defaults[key]
            if (value === '' || value === undefined || value === null || value === def) {
              next.delete(key)
            } else if (Array.isArray(value)) {
              next.delete(key)
              const defArr = Array.isArray(def) ? def : []
              if (value.length > 0 && JSON.stringify(value) !== JSON.stringify(defArr)) {
                for (const v of value) next.append(key, v)
              }
            } else {
              next.set(key, String(value))
            }
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return [values, setQuery] as const
}
