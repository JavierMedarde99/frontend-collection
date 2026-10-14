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

function stubAuth(activeCollections: string[], isAuthenticated = true, preferences: unknown = null) {
  mockedUseAuth.mockReturnValue({
    user: isAuthenticated ? { id: 'u1', username: 'javi', email: 'j@t.com' } : null,
    accessToken: isAuthenticated ? 'a' : null,
    isAuthenticated,
    initializing: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    activeCollections,
    preferences,
    refreshActiveCollections: vi.fn(),
    refreshPreferences: vi.fn(),
  } as any)
}

function renderNavbar(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NavbarFigures', () => {
  it('oculta Figuras si solo está activa la colección Libros', () => {
    stubAuth(['BOOKS'])
    renderNavbar('/')

    expect(screen.queryByText('Figuras')).not.toBeInTheDocument()
  })

  it('muestra Figuras y el sub-apartado Funko Pop con FUNKOS activo', () => {
    stubAuth(['FUNKOS'])
    renderNavbar('/figuras/funkopop')

    expect(screen.getByText('Figuras')).toBeInTheDocument()
    expect(screen.getByText('Funko Pop')).toBeInTheDocument()
  })

  it('con AMIIBOS muestra Figuras y Amiibo pero no Funko Pop', () => {
    stubAuth(['AMIIBOS'])
    renderNavbar('/figuras/amiibo')

    expect(screen.getByText('Figuras')).toBeInTheDocument()
    expect(screen.getByText('Amiibo')).toBeInTheDocument()
    expect(screen.queryByText('Funko Pop')).not.toBeInTheDocument()
  })

  it('sin sesión muestra Figuras y ambos sub-apartados', () => {
    stubAuth([], false)
    renderNavbar('/figuras')

    expect(screen.getByText('Figuras')).toBeInTheDocument()
    expect(screen.getByText('Funko Pop')).toBeInTheDocument()
    expect(screen.getByText('Amiibo')).toBeInTheDocument()
  })

  it('muestra Figuras a un usuario antiguo cuyas preferencias no incluyen funkos/amiibos', () => {
    // Usuario registrado antes de que existieran Funko/Amiibo: la lista de activas
    // (derivada del mapa guardado) no trae las claves nuevas, pero tampoco están
    // desactivadas, así que se consideran activas por defecto.
    stubAuth(
      ['BOOKS', 'GAMES', 'MAGIC', 'DECKS', 'BOARDGAMES', 'MOVIESHOWS'],
      true,
      {
        activeCollections: {
          books: true,
          games: true,
          magic: true,
          decks: true,
          boardgames: true,
          movieshows: true,
        },
        collectionVisibility: {},
      },
    )
    renderNavbar('/')

    expect(screen.getByText('Figuras')).toBeInTheDocument()
  })

  it('oculta Figuras si el usuario las ha desactivado explícitamente', () => {
    stubAuth(['BOOKS'], true, {
      activeCollections: { books: true, funkos: false, amiibos: false },
      collectionVisibility: {},
    })
    renderNavbar('/')

    expect(screen.queryByText('Figuras')).not.toBeInTheDocument()
  })
})
