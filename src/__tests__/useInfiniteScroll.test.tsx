import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import type { PageData } from '../hooks/usePagedList'

interface Item {
  id: string
}

function page(ids: string[], totalPages: number): PageData<Item> {
  const content = ids.map((id) => ({ id }))
  return { content, totalPages, totalElements: ids.length * totalPages }
}

type Trigger = (entries: [{ isIntersecting: boolean }]) => void

let trigger: Trigger | null = null

class MockIntersectionObserver {
  constructor(cb: Trigger) {
    trigger = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

function Probe({ filter, fetchPage }: { filter: string; fetchPage: (page: number, size: number) => Promise<PageData<Item>> }) {
  const result = useInfiniteScroll({
    size: 2,
    errorMessage: 'Error',
    fetchPage,
    deps: [filter],
  })
  return (
    <>
      <div ref={result.sentinelRef} data-testid="sentinel" />
      <div data-testid="state">
        {JSON.stringify({
          ids: result.items.map((i) => i.id),
          totalElements: result.totalElements,
          hasMore: result.hasMore,
          loading: result.loading,
          loadingMore: result.loadingMore,
          error: result.error,
        })}
      </div>
    </>
  )
}

function ProbeEnabled({ enabled, fetchPage }: { enabled: boolean; fetchPage: (page: number, size: number) => Promise<PageData<Item>> }) {
  const result = useInfiniteScroll({
    size: 2,
    errorMessage: 'Error',
    fetchPage,
    deps: [],
    enabled,
  })
  return (
    <>
      <div ref={result.sentinelRef} data-testid="sentinel" />
      <div data-testid="state">
        {JSON.stringify({
          ids: result.items.map((i) => i.id),
          loading: result.loading,
        })}
      </div>
    </>
  )
}

function stateJson(container: HTMLElement) {
  const el = container.querySelector('[data-testid="state"]')
  return JSON.parse(el?.textContent || '{}')
}

function intersect() {
  act(() => {
    trigger?.([{ isIntersecting: true }])
  })
}

beforeEach(() => {
  trigger = null
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useInfiniteScroll', () => {
  it('carga la primera página y acumula la siguiente al llegar al sentinela', async () => {
    const fetchPage = vi.fn(async (pageNum: number) =>
      pageNum === 0 ? page(['a', 'b'], 2) : page(['c', 'd'], 2),
    )
    const { container } = render(<Probe filter="" fetchPage={fetchPage} />)

    await waitFor(() => expect(stateJson(container).loading).toBe(false))
    expect(stateJson(container).ids).toEqual(['a', 'b'])
    expect(stateJson(container).hasMore).toBe(true)
    expect(fetchPage).toHaveBeenCalledTimes(1)

    intersect()

    await waitFor(() => expect(stateJson(container).ids).toEqual(['a', 'b', 'c', 'd']))
    expect(stateJson(container).hasMore).toBe(false)
    expect(stateJson(container).loadingMore).toBe(false)
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })

  it('no pide más páginas cuando no hay más', async () => {
    const fetchPage = vi.fn(async () => page(['a'], 1))
    const { container } = render(<Probe filter="" fetchPage={fetchPage} />)

    await waitFor(() => expect(stateJson(container).loading).toBe(false))
    expect(stateJson(container).hasMore).toBe(false)

    intersect()
    intersect()

    await act(async () => {})
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('resetea la acumulación al cambiar los filtros', async () => {
    let tag = 'A'
    const fetchPage = vi.fn(async (pageNum: number) => page([`${tag}${pageNum}`], 2))
    const { container, rerender } = render(<Probe filter="" fetchPage={fetchPage} />)

    await waitFor(() => expect(stateJson(container).ids).toEqual(['A0']))
    expect(fetchPage).toHaveBeenCalledTimes(1)

    intersect()
    await waitFor(() => expect(stateJson(container).ids).toEqual(['A0', 'A1']))

    tag = 'B'
    rerender(<Probe filter="x" fetchPage={fetchPage} />)

    await waitFor(() => expect(stateJson(container).ids).toEqual(['B0']))
    expect(fetchPage).toHaveBeenLastCalledWith(0, 2)
  })

  it('muestra error si falla la carga inicial', async () => {
    const fetchPage = vi.fn(async () => {
      throw new Error('Caído')
    })
    const { container } = render(<Probe filter="" fetchPage={fetchPage} />)

    await waitFor(() => expect(stateJson(container).loading).toBe(false))
    expect(stateJson(container).error).toBe('Caído')
    expect(stateJson(container).ids).toEqual([])
  })

  it('no busca nada mientras enabled es false y carga al activarse', async () => {
    const fetchPage = vi.fn(async () => page(['a'], 1))
    const { container, rerender } = render(<ProbeEnabled enabled={false} fetchPage={fetchPage} />)

    await act(async () => {})
    expect(fetchPage).not.toHaveBeenCalled()
    expect(stateJson(container).loading).toBe(false)
    expect(stateJson(container).ids).toEqual([])

    rerender(<ProbeEnabled enabled fetchPage={fetchPage} />)

    await waitFor(() => expect(stateJson(container).ids).toEqual(['a']))
    expect(fetchPage).toHaveBeenCalledTimes(1)
    expect(fetchPage).toHaveBeenLastCalledWith(0, 2)
  })
})
