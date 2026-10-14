import type { PageFunkoResponse, ListFunkosParams, Funko, FunkoFormData, PageFunkoSearchResult, FunkoCategory } from '../types'
import { throwRequestError } from './errors'
import { authFetch } from './authFetch'
import { apiUrl } from './apiBase'

const BASE_URL = '/api/v1/funkos'

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

export function listFunkos(params: ListFunkosParams = {}): Promise<PageFunkoResponse> {
  const search = new URLSearchParams()
  const { page, size, sort, name, status, owner } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (name) search.set('name', name)
  if (status) search.set('status', status)
  if (owner) search.set('owner', owner)
  const qs = search.toString()
  return request<PageFunkoResponse>(`${apiUrl(BASE_URL)}${qs ? `?${qs}` : ''}`) as Promise<PageFunkoResponse>
}

export function createFunko(funko: FunkoFormData): Promise<Funko> {
  return request<Funko>(apiUrl(BASE_URL), {
    method: 'POST',
    body: JSON.stringify(funko),
  }) as Promise<Funko>
}

export function getFunko(id: string): Promise<Funko> {
  return request<Funko>(`${apiUrl(BASE_URL)}/${id}`) as Promise<Funko>
}

export function updateFunko(id: string, funko: FunkoFormData): Promise<Funko> {
  return request<Funko>(`${apiUrl(BASE_URL)}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(funko),
  }) as Promise<Funko>
}

export function deleteFunko(id: string): Promise<null> {
  return request<null>(`${apiUrl(BASE_URL)}/${id}`, { method: 'DELETE' })
}

// Catálogo de categorías en uso en la colección (para autocompletar el selector).
export function listFunkoCategories(): Promise<FunkoCategory[]> {
  return request<FunkoCategory[]>(`${apiUrl(BASE_URL)}/categories`) as Promise<FunkoCategory[]>
}

// El /search de Funko devuelve un Page crudo de Spring (sin envoltorio `results`).
export function searchFunkosPage(name: string, page = 0, size = 10): Promise<PageFunkoSearchResult> {
  const qs = new URLSearchParams({ name, page: String(page), size: String(size) })
  return request<PageFunkoSearchResult>(`${apiUrl(BASE_URL)}/search?${qs}`) as Promise<PageFunkoSearchResult>
}
