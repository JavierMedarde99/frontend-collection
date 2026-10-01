import { afterEach, describe, expect, it, vi } from 'vitest'
import { listGamePlatforms } from '../api/gamesApi'

function jsonResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response
}

describe('gamesApi catalog de plataformas', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('llama a GET /api/v1/games/platforms', async () => {
    const fetchSpy = vi.fn(async (_url: unknown, _init?: unknown) => jsonResponse([]))
    vi.stubGlobal('fetch', fetchSpy)

    await listGamePlatforms()

    const [url, init] = fetchSpy.mock.calls[0] ?? []
    expect(String(url)).toContain('/api/v1/games/platforms')
    expect((init as RequestInit | undefined)?.method ?? 'GET').toBe('GET')
  })

  it('devuelve el array tal cual', async () => {
    const payload = [{ id: 1, name: 'PlayStation 5', slug: 'ps5' }]
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(payload)))

    await expect(listGamePlatforms()).resolves.toEqual(payload)
  })
})