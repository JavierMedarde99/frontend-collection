import { useEffect, useState } from 'react'

/**
 * Opciones del filtro de género: solo el catálogo del backend
 * (lo que hay en BD). Vacío hasta cargar o si falla.
 */
export function useGenreOptions(fetcher: () => Promise<string[]>) {
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return
        const seen = new Set<string>()
        const clean: string[] = []
        for (const g of list) {
          if (typeof g !== 'string' || g.trim() === '' || seen.has(g)) continue
          seen.add(g)
          clean.push(g)
        }
        setOptions(clean)
      })
      .catch(() => {
        // Sin catálogo: solo "Todos los géneros".
      })
    return () => {
      cancelled = true
    }
  }, [fetcher])

  return options
}
