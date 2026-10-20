import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameListPage from '../pages/GameListPage'
import { listGames } from '../api/gamesApi'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

vi.mock('../api/gamesApi', () => ({
  listGames: vi.fn(async () => ({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 12,
    empty: true,
  })),
  listGamePlatforms: vi.fn(async () => []),
  listGameGenres: vi.fn(async () => []),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedListGames = vi.mocked(listGames)

function renderList(initialEntry = '/juegos') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <GameListPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } } as never)
})

describe('GameListPage filtro de tipo', () => {
  it('ofrece Todos / Juegos / Contenido adicional y pide solo DLCs al elegirlo', async () => {
    const user = userEvent.setup()
    renderList()

    expect(screen.getByRole('button', { name: 'Filtrar por tipo: Todos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Filtrar por tipo: Juegos' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Filtrar por tipo: Contenido adicional' }))

    await waitFor(() =>
      expect(mockedListGames).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'dlc' })),
    )
    expect(screen.getByRole('button', { name: 'Filtrar por tipo: Contenido adicional' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('mantiene activo el filtro que viene en la URL', async () => {
    renderList('/juegos?type=dlc')

    await waitFor(() =>
      expect(mockedListGames).toHaveBeenCalledWith(expect.objectContaining({ type: 'dlc' })),
    )
    expect(screen.getByRole('button', { name: 'Filtrar por tipo: Contenido adicional' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
