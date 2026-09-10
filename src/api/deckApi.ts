import type { DeckResponse, DeckRequest, DeckCardRequest, DeckStatusResponse, ApiError } from '../types'

const BASE_URL = '/api/decks'

class RequestError extends Error implements ApiError {
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

export function listDecks(name?: string): Promise<DeckResponse[]> {
  const qs = name ? `?name=${encodeURIComponent(name)}` : ''
  return request<DeckResponse[]>(`${BASE_URL}${qs}`) as Promise<DeckResponse[]>
}

export function getDeck(id: string): Promise<DeckResponse> {
  return request<DeckResponse>(`${BASE_URL}/${id}`) as Promise<DeckResponse>
}

export function createDeck(deck: DeckRequest): Promise<DeckResponse> {
  return request<DeckResponse>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(deck),
  }) as Promise<DeckResponse>
}

export function updateDeck(id: string, deck: DeckRequest): Promise<DeckResponse> {
  return request<DeckResponse>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(deck),
  }) as Promise<DeckResponse>
}

export function deleteDeck(id: string): Promise<null> {
  return request<null>(`${BASE_URL}/${id}`, { method: 'DELETE' })
}

export function addCardToDeck(id: string, card: DeckCardRequest): Promise<DeckResponse> {
  return request<DeckResponse>(`${BASE_URL}/${id}/cards`, {
    method: 'POST',
    body: JSON.stringify(card),
  }) as Promise<DeckResponse>
}

export function removeCardFromDeck(id: string, scryfallId: string): Promise<DeckResponse> {
  return request<DeckResponse>(`${BASE_URL}/${id}/cards/${encodeURIComponent(scryfallId)}`, {
    method: 'DELETE',
  }) as Promise<DeckResponse>
}

export async function getDeckStatus(id: string): Promise<DeckStatusResponse> {
  // El backend devuelve un JSON {status, message}.
  const data = await request<DeckStatusResponse>(`${BASE_URL}/${id}/status`)
  if (!data || !['DRAFT', 'COMPLETE', 'INVALID'].includes(data.status)) {
    throw new RequestError(`Estado de mazo desconocido: ${JSON.stringify(data)}`)
  }
  return data
}
