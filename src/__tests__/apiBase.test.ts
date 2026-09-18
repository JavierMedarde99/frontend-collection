import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiUrl, initApiBase } from '../api/apiBase'

describe('apiBase', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('usa localhost si responde', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true }) as Response))
    await initApiBase()
    expect(apiUrl('/api/v1/books')).toBe('http://localhost:8080/api/v1/books')
  })

  it('usa producción si localhost falla', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('down')
    }))
    await initApiBase()
    expect(apiUrl('/api/v1/books')).toBe('https://backend-collection.onrender.com/api/v1/books')
  })

  it('usa producción si localhost no responde OK', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false }) as Response))
    await initApiBase()
    expect(apiUrl('/api/v1/books')).toBe('https://backend-collection.onrender.com/api/v1/books')
  })
})
