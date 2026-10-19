import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BoardGameListPage from '../pages/BoardGameListPage'
import { useAuth } from '../context/AuthContext'
import { listBoardGames } from '../api/boardgamesApi'
import { BoardGameStatus, type PageBoardGameResponse } from '../types'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

vi.mock('../api/boardgamesApi', () => ({
  listBoardGames: vi.fn(),
  deleteBoardGame: vi.fn(),
  listBoardGameGenres: vi.fn(async () => []),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedListBoardGames = vi.mocked(listBoardGames)

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
  root = null
  rootMargin = ''
  thresholds: number[] = []
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

function vacia(): PageBoardGameResponse {
  return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 12, empty: true }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } } as never)
  mockedListBoardGames.mockImplementation(async () => vacia())
})

describe('BoardGameListPage filtro de tipo', () => {
  it('ofrece las píldoras Todos, Bases y Expansiones', async () => {
    render(
      <MemoryRouter initialEntries={['/boardgames']}>
        <BoardGameListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Filtrar por tipo: Todos los tipos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filtrar por tipo: Bases' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filtrar por tipo: Expansiones' })).toBeInTheDocument()
  })

  it('al elegir Expansiones pide type=expansion al backend', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/boardgames']}>
        <BoardGameListPage />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Filtrar por tipo: Expansiones' }))

    await waitFor(() =>
      expect(mockedListBoardGames).toHaveBeenCalledWith(expect.objectContaining({ type: 'expansion' })),
    )
  })

  it('al volver a Todos deja de enviar el filtro de tipo', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/boardgames']}>
        <BoardGameListPage />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Filtrar por tipo: Expansiones' }))
    await waitFor(() =>
      expect(mockedListBoardGames).toHaveBeenCalledWith(expect.objectContaining({ type: 'expansion' })),
    )

    mockedListBoardGames.mockClear()
    await user.click(screen.getByRole('button', { name: 'Filtrar por tipo: Todos los tipos' }))

    await waitFor(() =>
      expect(mockedListBoardGames).toHaveBeenCalledWith(
        expect.not.objectContaining({ type: expect.anything() }),
      ),
    )
  })
})

describe('BoardGameListPage badge de expansión', () => {
  it('pinta la badge Expansión en las cards de expansión', async () => {
    mockedListBoardGames.mockResolvedValue({
      ...vacia(),
      content: [
        {
          id: 'ex1',
          title: 'Catan: Navegantes',
          status: BoardGameStatus.OWNED,
          bggType: 'boardgameexpansion',
          parentId: 'bg1',
          parentTitle: 'Catan',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      empty: false,
    })

    render(
      <MemoryRouter initialEntries={['/boardgames']}>
        <BoardGameListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Expansión')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Catan: Navegantes' })).toHaveAttribute('href', '/boardgames/ex1')
  })
})
