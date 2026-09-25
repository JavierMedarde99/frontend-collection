import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GameListPage from '../pages/GameListPage'
import { deleteGame, listGames } from '../api/gamesApi'
import { GamePlatform } from '../types/GamePlatform'
import { GameStatus } from '../types/GameStatus'

vi.mock('../api/gamesApi', () => ({
  listGames: vi.fn(),
  deleteGame: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 'u1', username: 'javi' } }),
}))

const mockedList = vi.mocked(listGames)

const zelda = {
  id: '1',
  title: 'Zelda',
  platform: GamePlatform.SWITCH,
  status: GameStatus.COMPLETED,
  genres: ['Aventura'],
}

function page(items: unknown[]) {
  return { content: items, totalPages: 1, totalElements: items.length, number: 0, size: 12, empty: items.length === 0 }
}

describe('GameListPage filtro por género', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    mockedList.mockResolvedValue(page([zelda]) as never)
    void deleteGame
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('al elegir género recarga con ?genre= en el endpoint', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <GameListPage />
      </MemoryRouter>,
    )
    await screen.findByText('Zelda')
    expect(mockedList).toHaveBeenCalledWith(expect.objectContaining({ genre: undefined }))

    await user.click(screen.getByRole('button', { name: /filtros/i }))
    await user.selectOptions(screen.getByLabelText('Filtrar por género'), 'RPG')

    await waitFor(() =>
      expect(mockedList).toHaveBeenCalledWith(expect.objectContaining({ genre: 'RPG' })),
    )
  })
})
