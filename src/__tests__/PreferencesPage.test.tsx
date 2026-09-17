import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PreferencesPage from '../pages/PreferencesPage'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../api/preferencesApi', () => ({
  setActiveCollections: vi.fn(),
  setCollectionVisibility: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'u1', username: 'javi', email: 'j@t.com' },
    accessToken: 'a',
    isAuthenticated: true,
    initializing: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    activeCollections: [],
    preferences: null,
    refreshActiveCollections: vi.fn(),
    refreshPreferences: vi.fn(),
  } as any)
})

describe('PreferencesPage', () => {
  it('muestra título y panel de preferencias', () => {
    render(
      <MemoryRouter>
        <PreferencesPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Preferencias' })).toBeInTheDocument()
    expect(screen.getByText('Preferencias de colección')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })
})
