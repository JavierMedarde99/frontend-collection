import { useCallback, useEffect, useState } from 'react'

export interface PageData<T> {
  content: T[]
  totalPages: number
  totalElements: number
}

interface UsePagedListOptions<T> {
  page: number
  size?: number
  errorMessage: string
  fetchPage: (page: number, size: number) => Promise<PageData<T>>
  /** Deps extra (filtros, ordenación): al cambiar recargan. */
  deps?: unknown[]
}

/**
 * Estado común de páginas de listado: carga, error y totales.
 * La página y los filtros los mantiene cada página (ver useListQuery)
 * para que cada cambio sea un único setParams atómico.
 */
export function usePagedList<T>({ page, size = 12, errorMessage, fetchPage, deps = [] }: UsePagedListOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPage(page, size)
      setItems(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : errorMessage)
    } finally {
      setLoading(false)
    }
    }, [page, size, ...deps])

  useEffect(() => {
    load()
  }, [load])

  return { items, totalPages, totalElements, loading, error, reload: load }
}
