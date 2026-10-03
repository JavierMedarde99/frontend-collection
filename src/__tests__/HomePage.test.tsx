import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import HomePage from '../pages/HomePage'

vi.mock('../api/statsApi', () => ({
  getGlobalStats: vi.fn(async () => ({
    collections: { books: 7, games: 3, magic: 5, decks: 2, boardgames: 4, movieshows: 6 },
  })),
}))

import { AuthProvider } from '../context/AuthContext'

function renderHome() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('muestra cifras por entidad con enlaces a cada lista', async () => {
    renderHome()

    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    for (const label of ['Libros', 'Videojuegos', 'Cartas Magic', 'Mazos', 'Juegos de mesa', 'Películas y series']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /Mazos/ }).getAttribute('href')).toBe('/magic/mazos')
  })

  it('ya no muestra la sección de añadido recientemente', async () => {
    renderHome()

    expect(await screen.findByText(/elementos guardados/)).toBeInTheDocument()
    expect(screen.queryByText('Añadido recientemente')).not.toBeInTheDocument()
  })
})