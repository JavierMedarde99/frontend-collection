const LOCAL_BASE = 'http://localhost:8080'
const REMOTE_BASE = 'https://backend-collection.onrender.com'
const PROBE_TIMEOUT_MS = 2500

let base = REMOTE_BASE

/** URL absoluta para un path de la API (p. ej. '/api/v1/books'). */
export function apiUrl(path: string): string {
  return `${base}${path}`
}

/**
 * Elige el backend al arrancar: localhost si responde, si no el
 * dominio de producción. Llamar una vez en main.tsx antes de renderizar.
 */
export async function initApiBase(): Promise<void> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
    const res = await fetch(`${LOCAL_BASE}/api/v1/stats`, { signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) base = LOCAL_BASE
  } catch {
    base = REMOTE_BASE
  }
}
