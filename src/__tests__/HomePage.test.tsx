import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HomePage from '../pages/HomePage'
import { getGlobalStats } from '../api/statsApi'

vi.mock('../api/statsApi', () => ({
  getGlobalStats: vi.fn(async () => ({
    collections: { books: 7, games: 3, magic: 5, decks: 2, boardgames: 4, movieshows: 6 },
  })),
}))

// Mock del contexto de auth: permite controlar anónimo vs autenticado con un subconjunto.
let mockAuth: { isAuthenticated: boolean; activeCollections: string[] } = {
  isAuthenticated: false,
  activeCollections: [],
}

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}))

beforeEach(() => {
  mockAuth = { isAuthenticated: false, activeCollections: [] }
})

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

/** Devuelve el ancla de la tarjeta-lomo de una colección (la vitrina no es un enlace). */
function spineAnchor(label: string): HTMLAnchorElement {
  const anchor = screen
    .getAllByText(label)
    .map((el) => el.closest('a'))
    .find((a) => a !== null)
  expect(anchor).not.toBeUndefined()
  return anchor as HTMLAnchorElement
}

describe('HomePage', () => {
  it('muestra la vitrina de curiosidades con una pieza por colección', async () => {
    renderHome()

    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Todas tus colecciones, por fin en orden' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Tu gabinete de curiosidades')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Vitrina de curiosidades/ })).toBeInTheDocument()
    for (const nick of ['Libros', 'Videojuegos', 'Magic', 'Mazos', 'Mesa', 'Cine']) {
      expect(screen.getAllByText(nick).length).toBeGreaterThan(0)
    }
  })

  it('muestra cifras por entidad con enlaces a cada lista', async () => {
    renderHome()

    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(spineAnchor('Mazos').getAttribute('href')).toBe('/magic/mazos')
    expect(spineAnchor('Libros').getAttribute('href')).toBe('/coleccion')
  })

  it('anima los contadores hasta el total', async () => {
    renderHome()

    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(await within(spineAnchor('Libros')).findByText('7')).toBeInTheDocument()
  })

  it('si la API falla, sigue mostrando la vitrina con cifras a cero', async () => {
    vi.mocked(getGlobalStats).mockRejectedValueOnce(new Error('red'))
    renderHome()

    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Vitrina de curiosidades/ })).toBeInTheDocument()
    expect(await within(spineAnchor('Libros')).findByText('0')).toBeInTheDocument()
    expect(await within(spineAnchor('Videojuegos')).findByText('0')).toBeInTheDocument()
  })

  it('autenticado con un subconjunto de colecciones, filtra las tarjetas y la vitrina', async () => {
    mockAuth = { isAuthenticated: true, activeCollections: ['BOOKS', 'MAGIC'] }
    renderHome()

    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(spineAnchor('Libros')).toBeTruthy()
    expect(spineAnchor('Cartas Magic')).toBeTruthy()
    expect(screen.queryByText('Videojuegos')).not.toBeInTheDocument()
    expect(screen.queryByText('Mazos')).not.toBeInTheDocument()
    expect(screen.getByText(/2 vitrinas/)).toBeInTheDocument()
  })

  it('ya no muestra la sección de añadido recientemente', async () => {
    renderHome()

    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(screen.queryByText('Añadido recientemente')).not.toBeInTheDocument()
  })

  it('con prefers-reduced-motion pinta el total directamente', async () => {
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    } as unknown as MediaQueryList)
    renderHome()

    expect(await within(spineAnchor('Libros')).findByText('7')).toBeInTheDocument()
    spy.mockRestore()
  })
})