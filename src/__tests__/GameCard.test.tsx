import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameCard from '../components/GameCard'
import { updateGame } from '../api/gamesApi'
import { GamePlatform, GameStatus } from '../types'
import type { Game } from '../types'

vi.mock('../api/gamesApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/gamesApi')>()),
  updateGame: vi.fn(),
}))

const mockedUpdate = vi.mocked(updateGame)

beforeEach(() => {
  vi.clearAllMocks()
})

const game: Game = {
  id: '1',
  title: 'Hollow Knight',
  platform: GamePlatform.PC,
  status: GameStatus.WISHLIST,
  genres: ['Metroidvania'],
}

function renderCard(data: Game = game, readOnly = false) {
  return render(
    <MemoryRouter>
      <GameCard game={data} readOnly={readOnly} onDelete={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('GameCard', () => {
  it('en WISHLIST muestra el botón En posesión y con el diálogo lo pasa a OWNED', async () => {
    const user = userEvent.setup()
    mockedUpdate.mockResolvedValue({
      ...game,
      status: GameStatus.OWNED,
      acquisitionDate: '2025-06-01',
      acquisitionPrice: 24.99,
    })
    renderCard()

    await user.click(screen.getByRole('button', { name: 'Marcar Hollow Knight como en posesión' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/Fecha de obtención/))
    await user.type(screen.getByLabelText(/Fecha de obtención/), '2025-06-01')
    await user.type(screen.getByLabelText(/Precio de adquisición/), '24.99')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: GameStatus.OWNED,
          acquisitionDate: '2025-06-01',
          acquisitionPrice: 24.99,
        }),
      ),
    )
    expect(await screen.findByText('En posesión')).toBeInTheDocument()
  })

  it('en OWNED muestra Jugando y con el diálogo lo pasa a PLAYING con fecha de inicio', async () => {
    const user = userEvent.setup()
    mockedUpdate.mockResolvedValue({ ...game, status: GameStatus.PLAYING, dateAdded: '2025-06-01' })
    renderCard({ ...game, status: GameStatus.OWNED })

    await user.click(screen.getByRole('button', { name: 'Empezar a jugar a Hollow Knight' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: GameStatus.PLAYING,
          dateAdded: new Date().toISOString().slice(0, 10),
        }),
      ),
    )
    expect(await screen.findByText('Jugando')).toBeInTheDocument()
  })

  it('en PLAYING muestra Completado y con el diálogo lo pasa a COMPLETED con fecha de fin', async () => {
    const user = userEvent.setup()
    mockedUpdate.mockResolvedValue({ ...game, status: GameStatus.COMPLETED, dateCompleted: '2025-06-01' })
    renderCard({ ...game, status: GameStatus.PLAYING, dateAdded: '2025-05-01' })

    await user.click(screen.getByRole('button', { name: 'Marcar Hollow Knight como completado' }))
    const dateInput = screen.getByLabelText(/Fecha de fin/)
    await user.clear(dateInput)
    await user.type(dateInput, '2025-06-01')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: GameStatus.COMPLETED,
          dateCompleted: '2025-06-01',
        }),
      ),
    )
    expect(await screen.findByText('Completado')).toBeInTheDocument()
  })

  it('no muestra botones de transición en la vista de otros usuarios', () => {
    renderCard(game, true)
    expect(screen.queryByRole('button', { name: 'Marcar Hollow Knight como en posesión' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('si el guardado falla muestra el error y no cambia de estado', async () => {
    const user = userEvent.setup()
    mockedUpdate.mockRejectedValue(new Error('boom'))
    renderCard()

    await user.click(screen.getByRole('button', { name: 'Marcar Hollow Knight como en posesión' }))
    await user.type(screen.getByLabelText(/Precio de adquisición/), '24.99')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar el videojuego.')
    expect(screen.getByRole('button', { name: 'Marcar Hollow Knight como en posesión' })).toBeInTheDocument()
  })
})