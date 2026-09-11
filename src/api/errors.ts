import type { ApiError } from '../types'

export class RequestError extends Error implements ApiError {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'RequestError'
    this.status = status
  }
}

/** Extrae un mensaje legible del cuerpo de error del backend. */
export function parseErrorBody(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    if ('message' in body && typeof body.message === 'string') {
      return body.message
    }
    if ('error' in body && typeof body.error === 'string') {
      return body.error
    }
  }
  return fallback
}

export async function throwRequestError(res: Response): Promise<never> {
  let message = `Error ${res.status}`
  try {
    message = parseErrorBody(await res.json(), message)
  } catch {
    /* ignore */
  }
  throw new RequestError(message, res.status)
}
