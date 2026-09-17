import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PublicProfilePage from '../pages/PublicProfilePage'

vi.mock('../api/usersApi', () => ({
  getPublicProfile: vi.fn(),
  getUserBooks: vi.fn(),
  getUserGames: vi.fn(),
  getUserMagicCards: vi.fn(),
  getUserDecks: vi.fn(),
  getUserBoardGames: vi.fn(),
  getUserMovieShows: vi.fn(),
}))

import { getPublicProfile, getUserBooks } from '../api/usersApi'

const mockedProfile = vi.mocked(getPublicProfile)
const mockedBooks = vi.mocked(getUserBooks)

let trigger: ((entries: [{ isIntersecting: boolean }]) => void) | null = null

class MockIntersectionObserver {
  constructor(cb: (entries: [{ isIntersecting: boolean }]) => void) {
    trigger = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

const profile = {
  username: 'ana',
  displayName: 'Ana',
  avatarUrl: null,
  bio: 'Coleccionista',
  publicCollectionCounts: { books: 1, games: 0, magic: 0, decks: 0, boardgames: 0, movieshows: 0 },
}

function bookPage() {
  return {
    content: [{ id: 'b1', title: 'Dune', author: 'Frank Herbert' }],
    totalPages: 1,
    totalElements: 1,
    number: 0,
    size: 12,
    empty: false,
  }
}

function renderProfile() {
  return render(
    <MemoryRouter initialEntries={['/perfil/ana']}>
      <Routes>
        <Route path="/perfil/:username" element={<PublicProfilePage />} />
        <Route path="/" element={<div>HOME</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  trigger = null
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('PublicProfilePage', () => {
  it('muestra cabecera y elementos públicos', async () => {
    mockedProfile.mockResolvedValue(profile)
    mockedBooks.mockResolvedValue(bookPage())
    renderProfile()

    expect(await screen.findByText('Ana')).toBeInTheDocument()
    expect(await screen.findByText('Dune')).toBeInTheDocument()
  })

  it('muestra no encontrado si el usuario no existe', async () => {
    mockedProfile.mockRejectedValue(new Error('No existe'))
    renderProfile()

    expect(await screen.findByText('Usuario no encontrado')).toBeInTheDocument()
  })

  it('muestra mensaje si la colección es privada', async () => {
    mockedProfile.mockResolvedValue(profile)
    mockedBooks.mockRejectedValue(Object.assign(new Error('Forbidden'), { status: 403 }))
    renderProfile()

    expect(await screen.findByText('Colección privada')).toBeInTheDocument()
  })
})
