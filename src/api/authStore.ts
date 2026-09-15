import { refresh as apiRefresh } from './authApi'

/**
 * Estado de auth fuera de React para la capa de API:
 * el access token vive en memoria y se comparte con AuthContext,
 * que lo sincroniza al hacer login/register/logout/restore.
 */

let accessToken: string | null = null
let refreshPromise: Promise<string> | null = null
let onExpired: () => void = () => {}
let navigator: ((to: string, options?: { replace?: boolean; state?: unknown }) => void) | null = null

const REFRESH_TOKEN_KEY = 'collection.refreshToken'

export function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function writeRefreshToken(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token)
    else localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    /* almacenamiento no disponible: la sesión vive solo en memoria */
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

export function setStoredAccessToken(token: string | null) {
  accessToken = token
}

export function setOnExpiredAuth(cb: () => void) {
  onExpired = cb
}

export function triggerExpiredAuth() {
  onExpired()
}

export function setAuthNavigator(nav: (to: string, options?: { replace?: boolean; state?: unknown }) => void) {
  navigator = nav
}

export function getAuthNavigator() {
  return navigator
}

/** Renueva el access token una sola vez aunque haya peticiones concurrentes. */
export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const stored = readRefreshToken()
      if (!stored) throw new Error('Sin refresh token')
      const res = await apiRefresh(stored)
      accessToken = res.accessToken
      writeRefreshToken(res.refreshToken)
      return res.accessToken
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
