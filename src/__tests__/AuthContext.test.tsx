import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'
import type { AuthResponse } from '../types'

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('../api/preferencesApi', () => ({
  getPreferences: vi.fn(),
  getActiveCollections: vi.fn(),
}))

import { login as apiLogin, register as apiRegister, refresh as apiRefresh } from '../api/authApi'
import { getActiveCollections, getPreferences } from '../api/preferencesApi'

const mockedGetPreferences = vi.mocked(getPreferences)
const mockedGetActive = vi.mocked(getActiveCollections)

const mockedLogin = vi.mocked(apiLogin)
const mockedRegister = vi.mocked(apiRegister)
const mockedRefresh = vi.mocked(apiRefresh)

const user = { id: 'u1', username: 'javi', email: 'javi@test.com', displayName: 'Javi' }

function authResponse(): AuthResponse {
  return { accessToken: 'access-1', refreshToken: 'refresh-1', user }
}

let captured: ReturnType<typeof useAuth> | null = null

function Capture() {
  captured = useAuth()
  return null
}

function renderProvider() {
  captured = null
  return render(
    <AuthProvider>
      <Capture />
    </AuthProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  mockedGetPreferences.mockResolvedValue({
    id: 'p1',
    userId: 'u1',
    activeCollections: { books: true },
    collectionVisibility: { books: 'PUBLIC' },
  })
  mockedGetActive.mockResolvedValue(['BOOKS'])
})

describe('AuthContext', () => {
  it('empieza sin usuario y sin sesión', async () => {
    renderProvider()
    await waitFor(() => expect(captured?.initializing).toBe(false))
    expect(captured?.user).toBeNull()
    expect(captured?.isAuthenticated).toBe(false)
    expect(mockedRefresh).not.toHaveBeenCalled()
  })

  it('login guarda usuario, tokens y refresh en localStorage', async () => {
    mockedLogin.mockResolvedValue(authResponse())
    renderProvider()
    await waitFor(() => expect(captured?.initializing).toBe(false))

    await act(() => captured!.login({ username: 'javi', password: 'secret123' }))

    expect(captured?.user).toMatchObject({ username: 'javi' })
    expect(captured?.isAuthenticated).toBe(true)
    expect(captured?.accessToken).toBe('access-1')
    expect(localStorage.getItem('collection.refreshToken')).toBe('refresh-1')
  })

  it('register guarda la sesión igual que login', async () => {
    mockedRegister.mockResolvedValue(authResponse())
    renderProvider()
    await waitFor(() => expect(captured?.initializing).toBe(false))

    await act(() => captured!.register({ username: 'javi', email: 'j@t.com', password: 'secret123' }))

    expect(captured?.isAuthenticated).toBe(true)
    expect(localStorage.getItem('collection.refreshToken')).toBe('refresh-1')
  })

  it('logout limpia estado y localStorage', async () => {
    mockedLogin.mockResolvedValue(authResponse())
    renderProvider()
    await waitFor(() => expect(captured?.initializing).toBe(false))
    await act(() => captured!.login({ username: 'javi', password: 'secret123' }))
    expect(captured?.isAuthenticated).toBe(true)

    act(() => captured!.logout())

    expect(captured?.user).toBeNull()
    expect(captured?.isAuthenticated).toBe(false)
    expect(localStorage.getItem('collection.refreshToken')).toBeNull()
  })

  it('restaura la sesión al montar si hay refresh token', async () => {
    localStorage.setItem('collection.refreshToken', 'old-refresh')
    mockedRefresh.mockResolvedValue({ accessToken: 'access-2', refreshToken: 'refresh-2', user })
    renderProvider()

    await waitFor(() => expect(captured?.initializing).toBe(false))
    expect(mockedRefresh).toHaveBeenCalledWith('old-refresh')
    expect(captured?.isAuthenticated).toBe(true)
    expect(localStorage.getItem('collection.refreshToken')).toBe('refresh-2')
  })

  it('limpia el token si el refresh falla al restaurar', async () => {
    localStorage.setItem('collection.refreshToken', 'bad-refresh')
    mockedRefresh.mockRejectedValue(new Error('Unauthorized'))
    renderProvider()

    await waitFor(() => expect(captured?.initializing).toBe(false))
    expect(captured?.isAuthenticated).toBe(false)
    expect(localStorage.getItem('collection.refreshToken')).toBeNull()
  })

  it('carga preferencias y activas al hacer login', async () => {
    mockedLogin.mockResolvedValue(authResponse())
    renderProvider()
    await waitFor(() => expect(captured?.initializing).toBe(false))

    await act(() => captured!.login({ username: 'javi', password: 'secret123' }))

    expect(mockedGetPreferences).toHaveBeenCalledWith('u1')
    expect(captured?.activeCollections).toEqual(['BOOKS'])
    expect(captured?.preferences?.activeCollections).toEqual({ books: true })
  })

  it('refreshPreferences recarga desde el backend', async () => {
    mockedLogin.mockResolvedValue(authResponse())
    renderProvider()
    await waitFor(() => expect(captured?.initializing).toBe(false))
    await act(() => captured!.login({ username: 'javi', password: 'secret123' }))

    mockedGetActive.mockResolvedValue(['BOOKS', 'GAMES'])
    await act(() => captured!.refreshPreferences())

    expect(captured?.activeCollections).toEqual(['BOOKS', 'GAMES'])
  })

  it('logout limpia preferencias y activas', async () => {
    mockedLogin.mockResolvedValue(authResponse())
    renderProvider()
    await waitFor(() => expect(captured?.initializing).toBe(false))
    await act(() => captured!.login({ username: 'javi', password: 'secret123' }))
    expect(captured?.activeCollections).toEqual(['BOOKS'])

    act(() => captured!.logout())

    expect(captured?.preferences).toBeNull()
    expect(captured?.activeCollections).toEqual([])
  })
})
