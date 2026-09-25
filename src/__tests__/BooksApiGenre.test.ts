import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listBooks } from '../api/booksApi'

function jsonResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response
}

const emptyPage = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 12, empty: true }

describe('booksApi genre multivalor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('serializa varios géneros como ?genre=A&genre=B', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(emptyPage))
    vi.stubGlobal('fetch', fetchSpy)
    await listBooks({ genre: ['Fantasía', 'Terror'] })
    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain('genre=Fantas%C3%ADa&genre=Terror')
  })

  it('sin géneros no añade el parámetro', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(emptyPage))
    vi.stubGlobal('fetch', fetchSpy)
    await listBooks({ genre: [] })
    expect(String(fetchSpy.mock.calls[0]?.[0])).not.toContain('genre')
  })
})
