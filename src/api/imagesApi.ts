import { throwRequestError } from './errors'
import { authFetch } from './authFetch'
import { apiUrl } from './apiBase'

const BASE_URL = '/api/v1/images'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface ImageResponse {
  url: string
  filename: string
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipo de archivo no permitido. Usa JPEG, PNG, WebP o GIF.'
  }
  if (file.size > MAX_SIZE) {
    return 'La imagen supera los 5 MB.'
  }
  return null
}

/** La URL pertenece a una imagen subida a nuestro backend (y por tanto se puede borrar). */
export function uploadedFilename(url: string): string | null {
  const marker = '/api/v1/images/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const filename = url.slice(idx + marker.length).split('?')[0]
  return filename || null
}

export async function uploadImage(file: File): Promise<ImageResponse> {
  const form = new FormData()
  form.append('file', file)
  // Sin Content-Type: el navegador pone el boundary del multipart.
  const res = await authFetch(`${apiUrl(BASE_URL)}/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    await throwRequestError(res)
  }
  return res.json() as Promise<ImageResponse>
}

export async function deleteImage(filename: string): Promise<void> {
  const res = await authFetch(`${apiUrl(BASE_URL)}/${encodeURIComponent(filename)}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 404) {
    await throwRequestError(res)
  }
}
