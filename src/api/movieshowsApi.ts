import type { PageMovieShowResponse, ListMovieShowsParams, MovieShow, MovieShowFormData, SearchMovieShowResult, ApiError } from '../types'
import { MediaType } from '../types'

const BASE_URL = '/api/movieshows'

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

export function listMovieShows(params: ListMovieShowsParams = {}): Promise<PageMovieShowResponse> {
  const search = new URLSearchParams()
  const { page, size, sort, name, status, mediaType } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (name) search.set('name', name)
  if (status) search.set('status', status)
  if (mediaType) search.set('mediaType', mediaType)
  const qs = search.toString()
  return request<PageMovieShowResponse>(`${BASE_URL}${qs ? `?${qs}` : ''}`) as Promise<PageMovieShowResponse>
}

export function getMovieShow(id: string): Promise<MovieShow> {
  return request<MovieShow>(`${BASE_URL}/${id}`) as Promise<MovieShow>
}

export function createMovieShow(movieShow: MovieShowFormData): Promise<MovieShow> {
  return request<MovieShow>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(movieShow),
  }) as Promise<MovieShow>
}

export function updateMovieShow(id: string, movieShow: MovieShowFormData): Promise<MovieShow> {
  return request<MovieShow>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(movieShow),
  }) as Promise<MovieShow>
}

export function deleteMovieShow(id: string): Promise<null> {
  return request<null>(`${BASE_URL}/${id}`, { method: 'DELETE' })
}

export function searchMovieShows(name: string, mediaType?: MediaType): Promise<SearchMovieShowResult[]> {
  const qs = new URLSearchParams({ name })
  if (mediaType) qs.set('mediaType', mediaType)
  return request<SearchMovieShowResult[]>(`${BASE_URL}/search?${qs}`) as Promise<SearchMovieShowResult[]>
}
