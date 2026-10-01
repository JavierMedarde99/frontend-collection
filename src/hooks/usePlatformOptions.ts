import { useEffect, useState } from 'react'
import type { PlatformInfo } from '../types'

/**
 * Opciones del selector de plataforma: solo el catálogo del backend
 * (GET /api/v1/games/platforms). Vacío hasta cargar o si falla.
 */
export function usePlatformOptions(fetcher: () => Promise<PlatformInfo[]>) {
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return
        const seen = new Set<string>()
        const clean: string[] = []
        for (const p of list) {
          const name = p?.name
          if (typeof name !== 'string' || name.trim() === '' || seen.has(name)) continue
          seen.add(name)
          clean.push(name)
        }
        setOptions(clean)
      })
      .catch(() => {
        // Sin catálogo: el selector queda con lo que ya hubiera seleccionado.
      })
    return () => {
      cancelled = true
    }
  }, [fetcher])

  return options
}