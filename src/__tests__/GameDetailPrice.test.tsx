import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameDetailPage from '../pages/GameDetailPage'
import { getGame } from '../api/gamesApi'
import { GamePlatform, GameStatus } from '../types'
import type { Game } from '../types'

vi.mock('../api/gamesApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/gamesApi')>()),
  getGame: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { username: 'javi' } }),
}))

const mockedGet = vi.mocked(getGame)

function gameWithAcquisition(status: GameStatus): Game {
  return {
    id: '1',
    title: 'Hollow Knight',
    platform: GamePlatform.PC,
    status,
    genres: ['Metroidvania'],
    acquisitionDate: '2024-03-15',
    acquisitionPrice: 12.5,
  }
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/juegos/1']}>
      <Routes>
        <Route path="/juegos/:id" element={<GameDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GameDetailPage precio de adquisición', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra la fecha y el precio de obtención cuando existen', async () => {
    mockedGet.mockResolvedValue(gameWithAcquisition(GameStatus.OWNED))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Hollow Knight' })).toBeInTheDocument()
    expect(screen.getByText('Fecha de obtención')).toBeInTheDocument()
    expect(screen.getByText('2024-03-15')).toBeInTheDocument()
    expect(screen.getByText('Precio de adquisición')).toBeInTheDocument()
    expect(screen.getByText('12.5 €')).toBeInTheDocument()
  })

  it('no muestra adquisición si el videojuego no la tiene', async () => {
    mockedGet.mockResolvedValue({ ...gameWithAcquisition(GameStatus.WISHLIST), acquisitionDate: undefined, acquisitionPrice: undefined })
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Hollow Knight' })).toBeInTheDocument()
    expect(screen.queryByText('Fecha de obtención')).not.toBeInTheDocument()
    expect(screen.queryByText('Precio de adquisición')).not.toBeInTheDocument()
  })
})