import { useCallback, useEffect, useState } from 'react'

export interface PageData<T> {
  content: T[]
  totalPages: number
  totalElements: number
}

interface UsePagedListOptions<T> {
  size?: number
  errorMessage: string
  fetchPage: (page: number, size: number) => Promise<PageData<T>>
  /** Deps extra (filtros, ordenación): al cambiar, la página vuelve a 0 y recarga. */
  deps?: unknown[]
}

/**
 * Estado común de páginas de listado: paginación, carga, error y
 * totales. Los filtros los mantiene cada página; al cambiar recargan
 * desde la primera página.
 */
export function usePagedList<T>({ size = 12, errorMessage, fetchPage, deps = [] }: UsePagedListOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(0)
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

  const gotoPage = useCallback((next: number) => {
    setPage(next)
  }, [])

  const resetPage = useCallback(() => {
    setPage(0)
  }, [])

  return { items, page, gotoPage, resetPage, totalPages, totalElements, loading, error, reload: load }
}
