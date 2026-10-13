import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAmiibo, listAmiibos, searchAmiibosPage } from '../api/amiibosApi'
import { setStoredAccessToken } from '../api/authStore'
import { AmiiboStatus } from '../types'

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  } as unknown as Response
}

const amiiboPage = {
  content: [{ id: 'a1', externalId: 'ext-1', name: 'Mario', status: 'OWNED' }],
  totalPages: 2,
  totalElements: 13,
  number: 1,
  size: 12,
  empty: false,
}

describe('amiibosApi listAmiibos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setStoredAccessToken(null)
  })

  it('construye la URL con page,size,sort,name,status,owner y sin viewerId', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(amiiboPage))
    vi.stubGlobal('fetch', fetchSpy)

    const result = await listAmiibos({
      page: 1,
      size: 12,
      sort: 'name,asc',
      status: AmiiboStatus.OWNED,
      owner: 'mine',
      name: 'x',
    })

    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(url.pathname).toBe('/api/v1/amiibos')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('size')).toBe('12')
    expect(url.searchParams.get('sort')).toBe('name,asc')
    expect(url.searchParams.get('name')).toBe('x')
    expect(url.searchParams.get('status')).toBe('OWNED')
    expect(url.searchParams.get('owner')).toBe('mine')
    expect(url.searchParams.has('viewerId')).toBe(false)
    expect(result).toEqual(amiiboPage)
  })

  it('omite los params vacíos y no añade query', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(amiiboPage))
    vi.stubGlobal('fetch', fetchSpy)

    await listAmiibos()

    const url = String(fetchSpy.mock.calls[0]?.[0])
    expect(url.endsWith('/api/v1/amiibos')).toBe(true)
    expect(url).not.toContain('?')
  })

  it('omite status/owner cuando llegan como cadena vacía', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(amiiboPage))
    vi.stubGlobal('fetch', fetchSpy)

    await listAmiibos({ status: '', owner: '' })

    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(url.searchParams.has('status')).toBe(false)
    expect(url.searchParams.has('owner')).toBe(false)
    expect(url.search).toBe('')
  })

  it('envía el Authorization Bearer cuando hay sesión (authFetch)', async () => {
    setStoredAccessToken('tok-123')
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => jsonResponse(amiiboPage))
    vi.stubGlobal('fetch', fetchSpy)

    await listAmiibos()

    const init = fetchSpy.mock.calls[0]?.[1]
    const headers = init?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer tok-123')
    expect(headers['Content-Type']).toBe('application/json')
  })
})

describe('amiibosApi searchAmiibosPage', () => {
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

    const result = await searchAmiibosPage('mario', 0, 10)

    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(url.pathname).toBe('/api/v1/amiibos/search')
    expect(url.searchParams.get('name')).toBe('mario')
    expect(url.searchParams.get('page')).toBe('0')
    expect(url.searchParams.get('size')).toBe('10')
    expect(result).toEqual(searchPage)
    expect(result.content[0]?.externalId).toBe('ext-9')
  })

  it('no aplica la guarda de 2 caracteres (basta con no estar vacío)', async () => {
    const searchPage = {
      content: [],
      totalPages: 0,
      totalElements: 0,
      number: 0,
      size: 10,
      empty: true,
    }
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse(searchPage))
    vi.stubGlobal('fetch', fetchSpy)

    await searchAmiibosPage('a')

    const url = new URL(String(fetchSpy.mock.calls[0]?.[0]))
    expect(url.pathname).toBe('/api/v1/amiibos/search')
    expect(url.searchParams.get('name')).toBe('a')
  })
})

describe('amiibosApi createAmiibo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hace POST con cuerpo JSON y devuelve el Amiibo creado', async () => {
    const created = { id: 'a1', externalId: 'ext-1', name: 'Mario', status: 'OWNED' }
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => jsonResponse(created))
    vi.stubGlobal('fetch', fetchSpy)

    const payload = { externalId: 'ext-1', name: 'Mario', status: AmiiboStatus.OWNED }
    const result = await createAmiibo(payload)

    const [url, init] = fetchSpy.mock.calls[0]!
    expect(new URL(String(url)).pathname).toBe('/api/v1/amiibos')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual(payload)
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(result).toEqual(created)
  })
})

describe('amiibosApi errores HTTP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lanza RequestError con el mensaje del backend', async () => {
    const fetchSpy = vi.fn(async (_url: RequestInfo | URL) => jsonResponse({ message: 'No autorizado' }, 401))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(listAmiibos()).rejects.toMatchObject({
      status: 401,
      message: 'No autorizado',
    })
  })
})
