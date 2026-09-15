import { getAccessToken, readRefreshToken, refreshAccessToken, triggerExpiredAuth } from './authStore'

function withAuth(options: RequestInit, token: string | null): RequestInit {
  if (!token) return options
  const headers = { ...(options.headers as Record<string, string> | undefined) }
  headers['Authorization'] = `Bearer ${token}`
  return { ...options, headers }
}

/**
 * fetch con Authorization y reintento único tras 401:
 * refresca el access token y repite la petición original.
 * Si no hay sesión o el refresh falla, hace logout y devuelve
 * el 401 original para que cada API lance su error habitual.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, withAuth(options, getAccessToken()))
  if (res.status !== 401 || !readRefreshToken()) return res
  try {
    const fresh = await refreshAccessToken()
    return await fetch(url, withAuth(options, fresh))
  } catch {
    triggerExpiredAuth()
    return res
  }
}
