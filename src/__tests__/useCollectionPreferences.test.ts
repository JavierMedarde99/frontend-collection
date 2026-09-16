import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useCollectionPreferences } from '../hooks/useCollectionPreferences'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

const mockedUseAuth = vi.mocked(useAuth)

function stubAuth(preferences: any) {
  mockedUseAuth.mockReturnValue({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    initializing: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    activeCollections: [],
    preferences,
    refreshActiveCollections: vi.fn(),
    refreshPreferences: vi.fn(),
  } as any)
}

describe('useCollectionPreferences', () => {
  it('isCollectionActive según el mapa', () => {
    stubAuth({ activeCollections: { books: true, magic: false }, collectionVisibility: {} })
    const { result } = renderHook(() => useCollectionPreferences())
    expect(result.current.isCollectionActive('books')).toBe(true)
    expect(result.current.isCollectionActive('magic')).toBe(false)
  })

  it('isCollectionPublic distingue PUBLIC de PRIVATE', () => {
    stubAuth({
      activeCollections: {},
      collectionVisibility: { games: 'PUBLIC', magic: 'PRIVATE' },
    })
    const { result } = renderHook(() => useCollectionPreferences())
    expect(result.current.isCollectionPublic('games')).toBe(true)
    expect(result.current.isCollectionPublic('magic')).toBe(false)
  })

  it('sin preferencias todo activo y público', () => {
    stubAuth(null)
    const { result } = renderHook(() => useCollectionPreferences())
    expect(result.current.isCollectionActive('books')).toBe(true)
    expect(result.current.isCollectionPublic('magic')).toBe(true)
  })

  it('expone refreshPreferences del contexto', async () => {
    const refreshPreferences = vi.fn()
    mockedUseAuth.mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      initializing: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      activeCollections: [],
      preferences: null,
      refreshActiveCollections: vi.fn(),
      refreshPreferences,
    } as any)
    const { result } = renderHook(() => useCollectionPreferences())
    await result.current.refreshPreferences()
    expect(refreshPreferences).toHaveBeenCalledTimes(1)
  })
})
