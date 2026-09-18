import type { PageMovieShowResponse, ListMovieShowsParams, MovieShow, MovieShowFormData, SearchMovieShowResult, PageMovieSearchResult } from '../types'
import { throwRequestError } from './errors'
import { authFetch } from './authFetch'
import { MediaType } from '../types'
import { apiUrl } from './apiBase'

const BASE_URL = '/api/v1/movieshows'

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

export function listMovieShows(params: ListMovieShowsParams = {}): Promise<PageMovieShowResponse> {
  const search = new URLSearchParams()
  const { page, size, sort, name, status, mediaType , owner, viewerId } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (name) search.set('name', name)
  if (status) search.set('status', status)
  if (mediaType) search.set('mediaType', mediaType)
  if (owner) search.set('owner', owner)
  if (viewerId) search.set('viewerId', viewerId)
  const qs = search.toString()
  return request<PageMovieShowResponse>(`${apiUrl(BASE_URL)}${qs ? `?${qs}` : ''}`) as Promise<PageMovieShowResponse>
}

export function getMovieShow(id: string): Promise<MovieShow> {
  return request<MovieShow>(`${apiUrl(BASE_URL)}/${id}`) as Promise<MovieShow>
}

export function createMovieShow(movieShow: MovieShowFormData): Promise<MovieShow> {
  return request<MovieShow>(apiUrl(BASE_URL), {
    method: 'POST',
    body: JSON.stringify(movieShow),
  }) as Promise<MovieShow>
}

export function updateMovieShow(id: string, movieShow: MovieShowFormData): Promise<MovieShow> {
  return request<MovieShow>(`${apiUrl(BASE_URL)}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(movieShow),
  }) as Promise<MovieShow>
}

export function deleteMovieShow(id: string): Promise<null> {
  return request<null>(`${apiUrl(BASE_URL)}/${id}`, { method: 'DELETE' })
}

export function searchMovieShows(name: string, mediaType?: MediaType): Promise<SearchMovieShowResult[]> {
  const qs = new URLSearchParams({ name })
  if (mediaType) qs.set('mediaType', mediaType)
  return request<SearchMovieShowResult[]>(`${apiUrl(BASE_URL)}/search?${qs}`) as Promise<SearchMovieShowResult[]>
}

export function searchMovieShowsPage(name: string, page = 0, size = 10, mediaType?: MediaType): Promise<PageMovieSearchResult> {
  const qs = new URLSearchParams({ name, page: String(page), size: String(size) })
  if (mediaType) qs.set('mediaType', mediaType)
  return request<PageMovieSearchResult>(`${apiUrl(BASE_URL)}/search?${qs}`) as Promise<PageMovieSearchResult>
}
