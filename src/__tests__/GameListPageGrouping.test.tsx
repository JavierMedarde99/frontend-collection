import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameListPage from '../pages/GameListPage'
import { listGames } from '../api/gamesApi'
import { useAuth } from '../context/AuthContext'
import { GameStatus } from '../types'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

vi.mock('../api/gamesApi', () => ({
  listGames: vi.fn(async () => ({
    content: [
      {
        gameKey: 'hollow-knight',
        title: 'Hollow Knight',
        thumbnailUrl: '/img.jpg',
        games: [
          { id: 'g1', title: 'Hollow Knight', platform: 'PC (Windows)', status: GameStatus.COMPLETED, userRating: 9 },
          { id: 'g2', title: 'Hollow Knight', platform: 'Nintendo Switch', status: GameStatus.WISHLIST },
        ],
      },
      {
        gameKey: 'celeste',
        title: 'Celeste',
        games: [{ id: 'g3', title: 'Celeste', platform: 'PC (Windows)', status: GameStatus.OWNED }],
      },
    ],
    totalPages: 1,
    totalElements: 2,
    number: 0,
    size: 12,
    empty: false,
  })),
  listGamePlatforms: vi.fn(async () => []),
  listGameGenres: vi.fn(async () => []),
  deleteGame: vi.fn(async () => null),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedListGames = vi.mocked(listGames)

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  mockedUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } } as never)
})

describe('GameListPage agrupada por juego', () => {
  it('pide groupBy=game y pinta una tarjeta por grupo', async () => {
    render(
      <MemoryRouter initialEntries={['/juegos']}>
        <GameListPage />
      </MemoryRouter>,
    )

    await waitFor(() => expect(mockedListGames).toHaveBeenCalled())
    expect(mockedListGames.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ groupBy: 'game' }))

    expect(await screen.findByText('Hollow Knight')).toBeInTheDocument()
    expect(screen.getByText('Celeste')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })
})
