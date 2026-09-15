import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types'
import { throwRequestError } from './errors'

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
  return request<AuthResponse>(`${BASE_URL}/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function login(data: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>(`${BASE_URL}/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function refresh(refreshToken: string): Promise<AuthResponse> {
  return request<AuthResponse>(`${BASE_URL}/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

export function me(accessToken: string): Promise<UserResponse> {
  return request<UserResponse>(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
