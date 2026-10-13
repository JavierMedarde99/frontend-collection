import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFunko, listFunkoCategories, listFunkos, searchFunkosPage } from '../api/funkosApi'
import { setStoredAccessToken } from '../api/authStore'
import { FunkoStatus } from '../types'

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response
}

const funkoPage = {
  content: [{ id: 'f1', externalId: 'ext-1', name: 'Batman', status: 'OWNED' }],
  totalPages: 2,
  totalElements: 13,
  number: 1,
  size: 12,
  empty: false,
}

describe('funkosApi listFunkos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setStoredAccessToken(null)
  })

  it('construye la URL con page,size,sort,name,status,owner y sin viewerId', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(funkoPage))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await listFunkos({
      page: 1,
      size: 12,
      sort: 'name,asc',
      status: FunkoStatus.OWNED,
      owner: 'mine',
      name: 'x',
    })

    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(url.pathname).toBe('/api/v1/funkos')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('size')).toBe('12')
    expect(url.searchParams.get('sort')).toBe('name,asc')
    expect(url.searchParams.get('name')).toBe('x')
    expect(url.searchParams.get('status')).toBe('OWNED')
    expect(url.searchParams.get('owner')).toBe('mine')
    expect(url.searchParams.has('viewerId')).toBe(false)
    expect(result).toEqual(funkoPage)
  })

  it('omite los params vacíos y no añade query', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(funkoPage))
    vi.stubGlobal('fetch', fetchSpy)

    await listFunkos()

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url.endsWith('/api/v1/funkos')).toBe(true)
    expect(url).not.toContain('?')
  })

  it('envía el Authorization Bearer cuando hay sesión (authFetch)', async () => {
    setStoredAccessToken('tok-123')
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => jsonResponse(funkoPage))
    vi.stubGlobal('fetch', fetchSpy)

    await listFunkos()

    const init = fetchSpy.mock.calls[0]?.[1]
    const headers = init?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer tok-123')
    expect(headers['Content-Type']).toBe('application/json')
  })
})

describe('funkosApi searchFunkosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('pide /search?name&page&size y devuelve el Page crudo', async () => {
    const searchPage = {
      content: [{ externalId: 'ext-9', name: 'Mario' }],
      totalPages: 3,
      totalElements: 25,
      number: 0,
      size: 10,
      empty: false,
    }
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(searchPage))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await searchFunkosPage('mario', 0, 10)

    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(url.pathname).toBe('/api/v1/funkos/search')
    expect(url.searchParams.get('name')).toBe('mario')
    expect(url.searchParams.get('page')).toBe('0')
    expect(url.searchParams.get('size')).toBe('10')
    expect(result).toEqual(searchPage)
    expect(result.content[0]?.externalId).toBe('ext-9')
  })
})

describe('funkosApi createFunko', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hace POST con cuerpo JSON y devuelve el Funko creado', async () => {
    const created = { id: 'f1', externalId: 'ext-1', name: 'Batman', status: 'OWNED' }
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => jsonResponse(created))
    vi.stubGlobal('fetch', fetchSpy)

    const payload = { externalId: 'ext-1', name: 'Batman', status: FunkoStatus.OWNED }
    const result = await createFunko(payload)

    const [url, init] = fetchSpy.mock.calls[0]!
    expect(new URL(String(url)).pathname).toBe('/api/v1/funkos')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual(payload)
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(result).toEqual(created)
  })
})

describe('funkosApi listFunkoCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('devuelve el array de categorías con name y count', async () => {
    const categories = [
      { name: 'Animation', count: 12 },
      { name: 'Marvel', count: 5 },
    ]
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(categories))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await listFunkoCategories()

    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).pathname).toBe('/api/v1/funkos/categories')
    expect(result).toEqual(categories)
  })
})

describe('funkosApi errores HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lanza RequestError con el mensaje del backend', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse({ message: 'No autorizado' }, 401))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(listFunkos()).rejects.toMatchObject({
      status: 401,
      message: 'No autorizado',
    })
  })
})
