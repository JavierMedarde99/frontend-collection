import type { PageBoardGameResponse, ListBoardGamesParams, BoardGame, BoardGameFormData, BoardGameSearchResult, BoardGameSearchResponse, PageBoardGameSearchResult } from '../types'
import { throwRequestError } from './errors'
import { authFetch } from './authFetch'

const BASE_URL = '/api/v1/boardgames'

async function request<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const res = await authFetch(url, {
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
  const results = data?.results
  return Array.isArray(results) ? results : (results?.content ?? [])
}

export async function searchBoardGamesPage(name: string, page = 0, size = 10): Promise<PageBoardGameSearchResult> {
  const qs = new URLSearchParams({ name, page: String(page), size: String(size) })
  const data = await request<BoardGameSearchResponse>(`${BASE_URL}/search?${qs}`)
  const results = data?.results
  if (Array.isArray(results)) {
    return { content: results, totalPages: 1, totalElements: results.length, number: 0, size: results.length, empty: results.length === 0 }
  }
  return {
    content: results?.content ?? [],
    totalPages: results?.totalPages ?? 0,
    totalElements: results?.totalElements ?? 0,
    number: page,
    size,
    empty: (results?.content ?? []).length === 0,
  }
}
