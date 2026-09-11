import type { PageBoardGameResponse, ListBoardGamesParams, BoardGame, BoardGameFormData, BoardGameSearchResult, BoardGameSearchResponse } from '../types'
import { throwRequestError } from './errors'

const BASE_URL = '/api/boardgames'

async function request<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    await throwRequestError(res)
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json() as Promise<T>
  return null
}

export function listBoardGames(params: ListBoardGamesParams = {}): Promise<PageBoardGameResponse> {
  const search = new URLSearchParams()
  const { page, size, sort, name, status } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (name) search.set('name', name)
  if (status) search.set('status', status)
  const qs = search.toString()
  return request<PageBoardGameResponse>(`${BASE_URL}${qs ? `?${qs}` : ''}`) as Promise<PageBoardGameResponse>
}

export function getBoardGame(id: string): Promise<BoardGame> {
  return request<BoardGame>(`${BASE_URL}/${id}`) as Promise<BoardGame>
}

export function createBoardGame(game: BoardGameFormData): Promise<BoardGame> {
  return request<BoardGame>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(game),
  }) as Promise<BoardGame>
}

export function updateBoardGame(id: string, game: BoardGameFormData): Promise<BoardGame> {
  return request<BoardGame>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(game),
  }) as Promise<BoardGame>
}

export function deleteBoardGame(id: string): Promise<null> {
  return request<null>(`${BASE_URL}/${id}`, { method: 'DELETE' })
}

export async function searchBoardGames(name: string): Promise<BoardGameSearchResult[]> {
  const data = await request<BoardGameSearchResponse>(`${BASE_URL}/search?name=${encodeURIComponent(name)}`)
  return data?.results ?? []
}
