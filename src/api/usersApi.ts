import type {
  PageBoardGameResponse,
  PageBookResponse,
  PageDeckResponse,
  PageGameResponse,
  PageMagicCardResponse,
  PageMovieShowResponse,
  PublicProfileResponse,
} from '../types'
import { throwRequestError } from './errors'

const BASE_URL = '/api/v1/users'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    await throwRequestError(res)
  }

  return res.json() as Promise<T>
}

function pageQs(page: number, size: number): string {
  return new URLSearchParams({ page: String(page), size: String(size) }).toString()
}

export function getPublicProfile(username: string): Promise<PublicProfileResponse> {
  return request<PublicProfileResponse>(`${BASE_URL}/${encodeURIComponent(username)}`)
}

export function getUserBooks(username: string, page = 0, size = 12): Promise<PageBookResponse> {
  return request<PageBookResponse>(`${BASE_URL}/${encodeURIComponent(username)}/books?${pageQs(page, size)}`)
}

export function getUserGames(username: string, page = 0, size = 12): Promise<PageGameResponse> {
  return request<PageGameResponse>(`${BASE_URL}/${encodeURIComponent(username)}/games?${pageQs(page, size)}`)
}

export function getUserMagicCards(username: string, page = 0, size = 12): Promise<PageMagicCardResponse> {
  return request<PageMagicCardResponse>(`${BASE_URL}/${encodeURIComponent(username)}/magic?${pageQs(page, size)}`)
}

export function getUserDecks(username: string, page = 0, size = 12): Promise<PageDeckResponse> {
  return request<PageDeckResponse>(`${BASE_URL}/${encodeURIComponent(username)}/decks?${pageQs(page, size)}`)
}

export function getUserBoardGames(username: string, page = 0, size = 12): Promise<PageBoardGameResponse> {
  return request<PageBoardGameResponse>(`${BASE_URL}/${encodeURIComponent(username)}/boardgames?${pageQs(page, size)}`)
}

export function getUserMovieShows(username: string, page = 0, size = 12): Promise<PageMovieShowResponse> {
  return request<PageMovieShowResponse>(`${BASE_URL}/${encodeURIComponent(username)}/movieshows?${pageQs(page, size)}`)
}
