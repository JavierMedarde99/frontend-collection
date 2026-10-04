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

function stubAuth(activeCollections: string[] = ['BOOKS', 'GAMES', 'MAGIC', 'DECKS', 'BOARDGAMES', 'MOVIESHOWS']) {
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

function renderNavbar(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Navbar />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Navbar — filete de acento por colección', () => {
  it('el enlace activo de Libros lleva --sc de su colección', () => {
    stubAuth()
    renderNavbar('/coleccion')

    const libros = screen.getByRole('link', { name: 'Libros', hidden: true })
    const style = libros.getAttribute('style') ?? ''
    expect(style).toContain('--sc')
    expect(style).toContain('#c2410c')
  })

  it('Inicio activo no lleva --sc (sin colección)', () => {
    stubAuth()
    renderNavbar('/')

    const inicio = screen.getByRole('link', { name: 'Collection — inicio' })
    const style = inicio.getAttribute('style')
    expect(style).toBeNull()
  })

  it('el sub-nav Magic usa el acento de Mazos en su enlace activo', () => {
    stubAuth()
    renderNavbar('/magic/mazos')

    const mazos = screen.getByRole('link', { name: 'Mazos', hidden: true })
    const style = mazos.getAttribute('style') ?? ''
    expect(style).toContain('#92600a')
  })
})