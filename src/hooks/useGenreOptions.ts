import { useEffect, useState } from 'react'

/**
 * Opciones del filtro de género: catálogo del backend (lo que hay en BD)
 * más la lista cerrada local como respaldo. Si falla la carga, solo la local.
 */
export function useGenreOptions(closed: string[], fetcher: () => Promise<string[]>) {
  const [options, setOptions] = useState<string[]>(closed)

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return
        const seen = new Set(closed)
        const extra: string[] = []
        for (const g of list) {
          if (typeof g !== 'string' || g.trim() === '' || seen.has(g)) continue
          seen.add(g)
          extra.push(g)
        }
        setOptions([...closed, ...extra])
      })
      .catch(() => {
        // Respaldo: lista cerrada.
      })
    return () => {
      cancelled = true
    }
  }, [fetcher, closed])

  return options
}
