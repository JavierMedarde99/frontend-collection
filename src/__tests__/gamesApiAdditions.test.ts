import { afterEach, describe, expect, it, vi } from 'vitest'
import { addGameAdditions, getGameAdditions, listGames } from '../api/gamesApi'
import { GameStatus } from '../types'

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response
}

const page = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: 12,
  empty: true,
}

describe('gamesApi contenido adicional', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('lista los juegos con el filtro type', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => jsonResponse(page))
    vi.stubGlobal('fetch', fetchSpy)

    await listGames({ type: 'dlc' })

    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]), 'http://localhost')
    expect(url.pathname).toBe('/api/v1/games')
    expect(url.searchParams.get('type')).toBe('dlc')
  })

  it('GET /api/v1/games/{id}/additions devuelve el catálogo', async () => {
    const payload = {
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: [
        {
          externalId: '355880',
          title: 'Blood and Wine',
          platform: 'PC',
          genres: ['RPG'],
          inCollection: false,
          alreadyLinked: false,
        },
      ],
      totalAvailable: 12,
    }
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => jsonResponse(payload))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(getGameAdditions('g1')).resolves.toEqual(payload)

    const [url, init] = fetchSpy.mock.calls[0] ?? []
    expect(String(url)).toContain('/api/v1/games/g1/additions')
    expect((init as RequestInit | undefined)?.method ?? 'GET').toBe('GET')
  })

  it('POST /api/v1/games/{id}/additions envía los ids y el estado elegido', async () => {
    const payload = { created: [], linked: [], skipped: [] }
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => jsonResponse(payload, 201))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(
      addGameAdditions('g1', ['355880', '378648'], GameStatus.COMPLETED),
    ).resolves.toEqual(payload)

    const [url, init] = fetchSpy.mock.calls[0] ?? []
    expect(String(url)).toContain('/api/v1/games/g1/additions')
    expect((init as RequestInit).method).toBe('POST')
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({
      externalIds: ['355880', '378648'],
      status: 'COMPLETED',
    })
  })
})
