import type { PageGameResponse, ListGamesParams, Game, GameFormData, SearchGameResult, GameAchievementsResponse, ApiError } from '../types'

const BASE_URL = '/api/games'

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

export function listGames(params: ListGamesParams = {}): Promise<PageGameResponse> {
  const search = new URLSearchParams()
  const { page, size, sort, name, platform, status } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (name) search.set('name', name)
  if (platform) search.set('platform', platform)
  if (status) search.set('status', status)
  const qs = search.toString()
  return request<PageGameResponse>(`${BASE_URL}${qs ? `?${qs}` : ''}`) as Promise<PageGameResponse>
}

export function getGame(id: string): Promise<Game> {
  return request<Game>(`${BASE_URL}/${id}`) as Promise<Game>
}

export function createGame(game: GameFormData): Promise<Game> {
  return request<Game>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(game),
  }) as Promise<Game>
}

export function updateGame(id: string, game: GameFormData): Promise<Game> {
  return request<Game>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(game),
  }) as Promise<Game>
}

export function deleteGame(id: string): Promise<null> {
  return request<null>(`${BASE_URL}/${id}`, { method: 'DELETE' })
}

export function searchGames(name: string): Promise<SearchGameResult[]> {
  return request<SearchGameResult[]>(`${BASE_URL}/search?name=${encodeURIComponent(name)}`) as Promise<SearchGameResult[]>
}

export function getGameAchievements(id: string, steamId: string): Promise<GameAchievementsResponse> {
  const qs = new URLSearchParams({ steamId })
  return request<GameAchievementsResponse>(`${BASE_URL}/${id}/achievements?${qs}`) as Promise<GameAchievementsResponse>
}