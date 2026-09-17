import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Navbar from '../components/Navbar'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../components/ExportButton', () => ({
  default: () => null,
}))

vi.mock('../components/ThemeToggle', () => ({
  default: () => null,
}))

import { useAuth } from '../context/AuthContext'

const mockedUseAuth = vi.mocked(useAuth)

function stubAuth(activeCollections: string[]) {
  mockedUseAuth.mockReturnValue({
    user: { id: 'u1', username: 'javi', email: 'j@t.com' },
    accessToken: 'a',
    isAuthenticated: true,
    initializing: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    activeCollections,
    preferences: null,
    refreshActiveCollections: vi.fn(),
    refreshPreferences: vi.fn(),
  } as any)
}

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NavbarActiveCollections', () => {
  it('oculta Magic y Mazos si están desactivados', () => {
    stubAuth(['BOOKS', 'GAMES'])
    renderNavbar()

    expect(screen.getByText('Libros')).toBeInTheDocument()
    expect(screen.queryByText('Magic')).not.toBeInTheDocument()
    expect(screen.queryByText('Mazos')).not.toBeInTheDocument()
  })

  it('muestra todo si no hay preferencias', () => {
    stubAuth([])
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
      refreshPreferences: vi.fn(),
    } as any)
    renderNavbar()

    expect(screen.getByText('Libros')).toBeInTheDocument()
    expect(screen.getByText('Magic')).toBeInTheDocument()
  })
})
