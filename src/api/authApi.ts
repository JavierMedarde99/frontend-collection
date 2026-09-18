import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, UserResponse } from '../types'
import { throwRequestError } from './errors'
import { authFetch } from './authFetch'
import { apiUrl } from './apiBase'

const BASE_URL = '/api/v1/auth'

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

export function register(data: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>(`${apiUrl(BASE_URL)}/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function login(data: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>(`${apiUrl(BASE_URL)}/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function refresh(refreshToken: string): Promise<AuthResponse> {
  return request<AuthResponse>(`${apiUrl(BASE_URL)}/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

export function me(accessToken: string): Promise<UserResponse> {
  return request<UserResponse>(`${apiUrl(BASE_URL)}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function updateMe(data: UpdateProfileRequest): Promise<UserResponse> {
  const res = await authFetch(`${apiUrl(BASE_URL)}/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    await throwRequestError(res)
  }
  return res.json() as Promise<UserResponse>
}

export async function deleteMe(): Promise<void> {
  const res = await authFetch(`${apiUrl(BASE_URL)}/me`, { method: 'DELETE' })
  if (!res.ok) {
    await throwRequestError(res)
  }
}
