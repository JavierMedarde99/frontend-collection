import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { importDeckFile, importDeckText, getDeckImportJob } from '../api/deckApi'
import type { DeckImportJobResponse } from '../types'

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response
}

const accepted = { jobId: 'j1', status: 'PENDING', statusUrl: 'x' }

const jobResponse: DeckImportJobResponse = {
  jobId: 'j1',
  status: 'COMPLETED',
  phase: 'DONE',
  deck: {
    id: 'd1',
    name: 'Mazo de Atraxa',
    commander: 'Atraxa',
    commanderColors: ['W', 'U', 'B', 'G'],
    cards: [{ cardName: 'Sol Ring', quantity: 1, inCollection: false, isProxy: false }],
  },
  commander: 'Atraxa',
  commanderColors: ['W', 'U', 'B', 'G'],
  unresolved: [],
  validation: { status: 'COMPLETE', reasons: [] },
  error: null,
  progress: { total: 1, processed: 1, resolved: 1, sideboardIgnored: 0 },
  createdAt: '2026-10-06T10:00:00Z',
  updatedAt: '2026-10-06T10:00:01Z',
  completedAt: '2026-10-06T10:00:01Z',
}

describe('deckApi importación de mazos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('importDeckText envía el contenido como text/plain con mode=replace por defecto', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _options?: RequestInit) => jsonResponse(accepted, 202))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await importDeckText('d1', '1 Sol Ring\n1 Arcane Signet')

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/decks/d1/imports/text'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '1 Sol Ring\n1 Arcane Signet',
      }),
    )
    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain('mode=replace')
    expect(result).toEqual(accepted)
  })

  it('importDeckText usa mode=merge cuando se pide', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _options?: RequestInit) => jsonResponse(accepted, 202))
    vi.stubGlobal('fetch', fetchSpy)

    await importDeckText('d1', '1 Sol Ring', 'merge')

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain('mode=merge')
  })

  it('importDeckFile sube el archivo como FormData sin Content-Type fijo', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _options?: RequestInit) => jsonResponse(accepted, 202))
    vi.stubGlobal('fetch', fetchSpy)

    const file = new File(['1 Sol Ring'], 'mazo.txt')
    await importDeckFile('d1', file)

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain('/api/v1/decks/d1/imports')
    expect(url).toContain('mode=replace')

    const options = fetchSpy.mock.calls[0]?.[1] as RequestInit
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect((options.body as FormData).get('file')).toBe(file)
    expect(options.headers).toEqual({})
  })

  it('getDeckImportJob consulta el job y devuelve el progreso', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _options?: RequestInit) => jsonResponse(jobResponse))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await getDeckImportJob('d1', 'j1')

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain('/api/v1/decks/d1/imports/j1')
    expect(result).toEqual(jobResponse)
  })

  it('lanza RequestError con el mensaje del backend cuando el job no existe (404)', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _options?: RequestInit) => jsonResponse({ message: 'Job no encontrado' }, 404))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(getDeckImportJob('d1', 'x')).rejects.toMatchObject({
      status: 404,
      message: 'Job no encontrado',
    })
  })
})