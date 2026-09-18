import type {
  ActiveCollectionsRequest,
  CollectionVisibilityRequest,
  UserPreferences,
  UserPreferencesRequest,
} from '../types'
import { throwRequestError } from './errors'
import { authFetch } from './authFetch'
import { apiUrl } from './apiBase'

const BASE_URL = '/api/v1/preferences'

function qs(userId: string): string {
  return new URLSearchParams({ currentUserId: userId }).toString()
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await authFetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    await throwRequestError(res)
  }

  return res.json() as Promise<T>
}

export function getPreferences(userId: string): Promise<UserPreferences> {
  return request<UserPreferences>(`${apiUrl(BASE_URL)}?${qs(userId)}`)
}

export function updatePreferences(userId: string, data: UserPreferencesRequest): Promise<UserPreferences> {
  return request<UserPreferences>(`${apiUrl(BASE_URL)}?${qs(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function setActiveCollections(userId: string, collections: ActiveCollectionsRequest['collections']): Promise<UserPreferences> {
  return request<UserPreferences>(`${apiUrl(BASE_URL)}/active-collections?${qs(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ collections } satisfies ActiveCollectionsRequest),
  })
}

export function setCollectionVisibility(
  userId: string,
  visibility: CollectionVisibilityRequest['visibility'],
): Promise<UserPreferences> {
  return request<UserPreferences>(`${apiUrl(BASE_URL)}/collection-visibility?${qs(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ visibility } satisfies CollectionVisibilityRequest),
  })
}

/** El backend devuelve códigos en mayúsculas: ["BOOKS", "MAGIC", ...]. */
export function getActiveCollections(userId: string): Promise<string[]> {
  return request<string[]>(`${apiUrl(BASE_URL)}/active-collections?${qs(userId)}`)
}
