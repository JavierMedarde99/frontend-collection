import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addMagicCardCopies, getMagicCardPrintingsPage } from '../api/magicApi'

function jsonResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response
}

const printingsPage = {
  content: [
    {
      scryfallId: 'imp-1',
      name: 'Plains',
      set: 'FDN',
      collectorNumber: '263',
    },
  ],
  totalPages: 1,
  totalElements: 175,
  size: 175,
  number: 0,
  first: true,
  last: true,
  empty: false,
}

describe('magicApi getMagicCardPrintingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('pide la página 0 por defecto con el scryfallId en la ruta', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(printingsPage))
    vi.stubGlobal('fetch', fetchSpy)

    await getMagicCardPrintingsPage('imp-1')

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain('/api/v1/magic/scryfall/imp-1/printings?page=0')
  })

  it('admite una página distinta en base 0', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(printingsPage))
    vi.stubGlobal('fetch', fetchSpy)

    await getMagicCardPrintingsPage('imp-1', 2)

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain('printings?page=2')
  })

  it('codifica el scryfallId en la ruta', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(printingsPage))
    vi.stubGlobal('fetch', fetchSpy)

    await getMagicCardPrintingsPage('a b/c')

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url).toContain('/scryfall/a%20b%2Fc/printings')
  })
})

describe('magicApi addMagicCardCopies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hace POST a /copies con la cantidad en la query', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({ id: 'mc1', quantity: 5 }),
    )
    vi.stubGlobal('fetch', fetchSpy)

    const result = await addMagicCardCopies('mc1', 3)

    const [url, init] = fetchSpy.mock.calls[0]!
    expect(String(url)).toContain('/api/v1/magic/mc1/copies?quantity=3')
    expect(init?.method).toBe('POST')
    expect(result).toEqual({ id: 'mc1', quantity: 5 })
  })

  it('codifica el id en la ruta', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse({ id: 'x', quantity: 2 }))
    vi.stubGlobal('fetch', fetchSpy)

    await addMagicCardCopies('a b/c', 2)

    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain('/api/v1/magic/a%20b%2Fc/copies')
  })
})