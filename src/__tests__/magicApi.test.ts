import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMagicCardPrintingsPage } from '../api/magicApi'

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