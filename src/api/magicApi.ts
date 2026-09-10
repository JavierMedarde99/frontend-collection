import type { PageMagicCardResponse, ListMagicCardsParams, MagicCardResponse, MagicCardRequest, MagicCardSearchResult, MagicCardSearchResponse } from '../types'

const BASE_URL = '/api/magic'

class RequestError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'RequestError'
    this.status = status
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const body: Record<string, unknown> = await res.json()
      if (body && typeof body === 'object') {
        if ('message' in body && typeof body.message === 'string') {
          message = body.message
        } else if ('error' in body && typeof body.error === 'string') {
          message = body.error
        }
      }
    } catch {
      /* ignore */
    }
    throw new RequestError(message, res.status)
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json() as Promise<T>
  return null
}

export function listMagicCards(params: ListMagicCardsParams = {}): Promise<PageMagicCardResponse> {
  const search = new URLSearchParams()
  const { page, size, sort, name, rarity, color, type } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (name) search.set('name', name)
  if (rarity) search.set('rarity', rarity)
  if (color) search.set('color', color)
  if (type) search.set('type', type)
  const qs = search.toString()
  return request<PageMagicCardResponse>(`${BASE_URL}${qs ? `?${qs}` : ''}`) as Promise<PageMagicCardResponse>
}

export function getMagicCard(id: string): Promise<MagicCardResponse> {
  return request<MagicCardResponse>(`${BASE_URL}/${id}`) as Promise<MagicCardResponse>
}

export function createMagicCard(card: MagicCardRequest): Promise<MagicCardResponse> {
  return request<MagicCardResponse>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(card),
  }) as Promise<MagicCardResponse>
}

export function updateMagicCard(id: string, card: MagicCardRequest): Promise<MagicCardResponse> {
  return request<MagicCardResponse>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(card),
  }) as Promise<MagicCardResponse>
}

export function deleteMagicCard(id: string): Promise<null> {
  return request<null>(`${BASE_URL}/${id}`, { method: 'DELETE' })
}

export async function searchMagicCards(name: string): Promise<MagicCardSearchResult[]> {
  const data = await request<MagicCardSearchResponse>(`${BASE_URL}/search?name=${encodeURIComponent(name)}`)
  return data?.results ?? []
}

export function addMagicCardFromScryfall(scryfallId: string): Promise<MagicCardResponse> {
  return request<MagicCardResponse>(`${BASE_URL}/scryfall/${encodeURIComponent(scryfallId)}`, {
    method: 'POST',
  }) as Promise<MagicCardResponse>
}
