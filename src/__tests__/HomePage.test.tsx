import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import HomePage from '../pages/HomePage'

vi.mock('../api/booksApi', () => ({
  listBooks: vi.fn(async () => ({ content: [], totalPages: 0, totalElements: 7, number: 0, size: 1, empty: true })),
}))

vi.mock('../api/gamesApi', () => ({
  listGames: vi.fn(async () => ({ content: [], totalPages: 0, totalElements: 3, number: 0, size: 1, empty: true })),
}))

vi.mock('../api/magicApi', () => ({
  listMagicCards: vi.fn(async () => ({ content: [], totalPages: 0, totalElements: 5, number: 0, size: 1, empty: true })),
}))

vi.mock('../api/deckApi', () => ({
  listDecks: vi.fn(async () => ({
    content: [{ id: 'd1', name: 'Mi Mazo', createdAt: '2026-02-01T10:00:00Z', cards: [] }],
    totalPages: 1,
    totalElements: 2,
    number: 0,
    size: 5,
    empty: false,
  })),
}))

vi.mock('../api/boardgamesApi', () => ({
  listBoardGames: vi.fn(async () => ({ content: [], totalPages: 0, totalElements: 4, number: 0, size: 1, empty: true })),
}))

vi.mock('../api/movieshowsApi', () => ({
  listMovieShows: vi.fn(async () => ({ content: [], totalPages: 0, totalElements: 6, number: 0, size: 1, empty: true })),
}))

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('muestra cifras por entidad con enlaces a cada lista', async () => {
    renderHome()

    expect(await screen.findByText('Tu colección en cifras')).toBeInTheDocument()
    for (const label of ['Libros', 'Videojuegos', 'Cartas Magic', 'Mazos', 'Juegos de mesa', 'Películas y series']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /Mazos/ }).getAttribute('href')).toBe('/magic/mazos')
  })

  it('muestra el total de mazos y los incluye en recientes (respuesta paginada)', async () => {
    renderHome()

    // Si listDecks se tratase como array, fetchRecent lanzaría y esto no aparecería.
    expect(await screen.findByText('Mi Mazo')).toBeInTheDocument()
  })
})
