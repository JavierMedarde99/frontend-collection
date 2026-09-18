import { throwRequestError } from './errors'
import { apiUrl } from './apiBase'

const BASE_URL = '/api/v1/stats'

export interface GlobalStatsResponse {
  collections: Record<string, number>
}

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

/** Cuántos items hay en cada colección (global). */
export function getGlobalStats(): Promise<GlobalStatsResponse> {
  return request<GlobalStatsResponse>(apiUrl(BASE_URL))
}
