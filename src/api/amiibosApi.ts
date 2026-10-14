import type { PageAmiiboResponse, ListAmiibosParams, Amiibo, AmiiboFormData, PageAmiiboSearchResult } from '../types'
import { throwRequestError } from './errors'
import { authFetch } from './authFetch'
import { apiUrl } from './apiBase'

const BASE_URL = '/api/v1/amiibos'

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

export function listAmiibos(params: ListAmiibosParams = {}): Promise<PageAmiiboResponse> {
  const search = new URLSearchParams()
  const { page, size, sort, name, status, owner } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (name) search.set('name', name)
  if (status) search.set('status', status)
  if (owner) search.set('owner', owner)
  const qs = search.toString()
  return request<PageAmiiboResponse>(`${apiUrl(BASE_URL)}${qs ? `?${qs}` : ''}`) as Promise<PageAmiiboResponse>
}

export function createAmiibo(amiibo: AmiiboFormData): Promise<Amiibo> {
  return request<Amiibo>(apiUrl(BASE_URL), {
    method: 'POST',
    body: JSON.stringify(amiibo),
  }) as Promise<Amiibo>
}

export function getAmiibo(id: string): Promise<Amiibo> {
  return request<Amiibo>(`${apiUrl(BASE_URL)}/${id}`) as Promise<Amiibo>
}

export function updateAmiibo(id: string, amiibo: AmiiboFormData): Promise<Amiibo> {
  return request<Amiibo>(`${apiUrl(BASE_URL)}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(amiibo),
  }) as Promise<Amiibo>
}

export function deleteAmiibo(id: string): Promise<null> {
  return request<null>(`${apiUrl(BASE_URL)}/${id}`, { method: 'DELETE' })
}

// El /search de Amiibo devuelve un Page crudo de Spring (sin envoltorio `results`).
export function searchAmiibosPage(name: string, page = 0, size = 10): Promise<PageAmiiboSearchResult> {
  const qs = new URLSearchParams({ name, page: String(page), size: String(size) })
  return request<PageAmiiboSearchResult>(`${apiUrl(BASE_URL)}/search?${qs}`) as Promise<PageAmiiboSearchResult>
}
