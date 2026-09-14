import { useCallback, useEffect, useRef, useState } from 'react'
import type { PageData } from './usePagedList'

interface UseInfiniteScrollOptions<T> {
  size?: number
  errorMessage: string
  fetchPage: (page: number, size: number) => Promise<PageData<T>>
  /** Deps extra (filtros, ordenación): al cambiar resetean la acumulación. */
  deps?: unknown[]
}

/**
 * Scroll infinito: acumula páginas sucesivas y carga más al llegar
 * al sentinela (IntersectionObserver).
 * - `loading`: carga inicial (mostrar skeleton completo).
 * - `loadingMore`: siguientes páginas (mostrar spinner inline).
 * - Cambiar filtros (deps) o llamar a `reload` resetea y recarga
 *   desde la página 0. Las respuestas en vuelo se ignoran.
 */
export function useInfiniteScroll<T>({ size = 12, errorMessage, fetchPage, deps = [] }: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const pageRef = useRef(0)
  const genRef = useRef(0)
  const fetchRef = useRef(fetchPage)
  fetchRef.current = fetchPage
  const sizeRef = useRef(size)
  sizeRef.current = size
  const stateRef = useRef({ hasMore: true, loading: true, loadingMore: false })
  stateRef.current = { hasMore, loading, loadingMore }

  const loadFirst = useCallback(async () => {
    const gen = ++genRef.current
    pageRef.current = 0
    setLoading(true)
    setLoadingMore(false)
    setError(null)
    try {
      const data = await fetchRef.current(0, sizeRef.current)
      if (gen !== genRef.current) return
      setItems(Array.isArray(data?.content) ? data.content : [])
      setTotalElements(data?.totalElements || 0)
      setHasMore(1 < (data?.totalPages || 0))
    } catch (err) {
      if (gen !== genRef.current) return
      setError(err instanceof Error ? err.message : errorMessage)
      setItems([])
      setTotalElements(0)
      setHasMore(false)
    } finally {
      if (gen === genRef.current) setLoading(false)
    }
  }, [size, errorMessage, ...deps])

  const loadMore = useCallback(async () => {
    const s = stateRef.current
    if (!s.hasMore || s.loading || s.loadingMore) return
    const gen = genRef.current
    setLoadingMore(true)
    try {
      const next = pageRef.current + 1
      const data = await fetchRef.current(next, sizeRef.current)
      if (gen !== genRef.current) return
      const content = Array.isArray(data?.content) ? data.content : []
      pageRef.current = next
      setItems((prev) => [...prev, ...content])
      setHasMore(next + 1 < (data?.totalPages || 0))
    } catch (err) {
      if (gen !== genRef.current) return
      setError(err instanceof Error ? err.message : errorMessage)
    } finally {
      if (gen === genRef.current) setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadFirst()
  }, [loadFirst])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore()
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return { items, totalElements, hasMore, loading, loadingMore, error, sentinelRef, reload: loadFirst }
}
