import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import GameGroupCard from '../components/GameGroupCard'
import { GameStatus } from '../types'
import { updateGame } from '../api/gamesApi'

vi.mock('../api/gamesApi', () => ({
  updateGame: vi.fn(async (id: string) => ({ id })),
}))

const mockedUpdateGame = vi.mocked(updateGame)

describe('GameGroupCard', () => {
  const group = {
    gameKey: 'hk',
    title: 'Hollow Knight',
    thumbnailUrl: '/img.jpg',
    games: [
      { id: 'g1', title: 'Hollow Knight', platform: 'PC (Windows)', status: GameStatus.COMPLETED, thumbnailUrl: '/img.jpg', userRating: 9 },
      { id: 'g2', title: 'Hollow Knight', platform: 'Nintendo Switch', status: GameStatus.WISHLIST, thumbnailUrl: undefined, userRating: undefined },
    ],
  }

  it('muestra una fila por plataforma con su estado', () => {
    render(
      <MemoryRouter>
        <GameGroupCard group={group} />
      </MemoryRouter>
    )
    expect(screen.getByText('PC (Windows)')).toBeInTheDocument()
    expect(screen.getByText('Nintendo Switch')).toBeInTheDocument()
    expect(screen.getByText('Completado')).toBeInTheDocument()
    expect(screen.getByText('Lista de deseos')).toBeInTheDocument()
  })

  it('el título enlaza al primer registro', () => {
    render(
      <MemoryRouter>
        <GameGroupCard group={group} />
      </MemoryRouter>
    )
    const links = screen.getAllByRole('link', { name: /Hollow Knight/ })
    expect(links[0]).toHaveAttribute('href', '/juegos/g1')
  })

  it('los botones de cada fila actúan sobre el registro de esa fila', async () => {
    mockedUpdateGame.mockResolvedValueOnce({
      id: 'g2',
      title: 'Hollow Knight',
      platform: 'Nintendo Switch',
      status: GameStatus.OWNED,
      acquisitionDate: '2026-01-01',
      acquisitionPrice: 10,
    } as never)

    render(
      <MemoryRouter>
        <GameGroupCard group={group} />
      </MemoryRouter>
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Marcar Hollow Knight (Nintendo Switch) como en posesión' }),
    )
    await userEvent.type(screen.getByLabelText(/Precio de adquisición/), '10')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(mockedUpdateGame).toHaveBeenCalledWith(
        'g2',
        expect.objectContaining({ platform: 'Nintendo Switch', status: GameStatus.OWNED }),
      ),
    )
  })
})
