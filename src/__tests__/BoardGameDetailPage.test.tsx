import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BoardGameDetailPage from '../pages/BoardGameDetailPage'
import { addExpansions, getBoardGame, getExpansions, listBoardGames } from '../api/boardgamesApi'
import { BoardGameStatus, type BoardGame, type PageBoardGameResponse } from '../types'

const { authState } = vi.hoisted(() => ({
  authState: {
    value: { isAuthenticated: true, user: { id: 'u1', username: 'javi' } } as {
      isAuthenticated: boolean
      user: { id?: string; username: string } | null
    },
  },
}))

vi.mock('../api/boardgamesApi', () => ({
  getBoardGame: vi.fn(),
  deleteBoardGame: vi.fn(),
  listBoardGames: vi.fn(),
  addExpansions: vi.fn(),
  getExpansions: vi.fn(),
  listBoardGameGenres: vi.fn(async () => []),
}))

vi.mock('../context/AuthContext', () => ({ useAuth: () => authState.value }))

const base: BoardGame = {
  id: 'bg1',
  title: 'Catan',
  status: BoardGameStatus.OWNED,
  bggType: 'boardgame',
  bggId: '13',
  userOwned: { username: 'javi' },
}

const expansion: BoardGame = {
  id: 'ex1',
  title: 'Catan: Navegantes',
  status: BoardGameStatus.OWNED,
  bggType: 'boardgameexpansion',
  parentId: 'bg1',
  parentTitle: 'Catan',
  userOwned: { username: 'javi' },
}

function page(content: BoardGame[]): PageBoardGameResponse {
  return {
    content,
    totalPages: 1,
    totalElements: content.length,
    number: 0,
    size: 100,
    empty: content.length === 0,
  }
}

function renderPage(id = 'bg1') {
  return render(
    <MemoryRouter initialEntries={[`/boardgames/${id}`]}>
      <Routes>
        <Route path="/boardgames/:id" element={<BoardGameDetailPage />} />
        <Route path="/boardgames/:id/editar" element={<p>Editar</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BoardGameDetailPage expansiones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.value = { isAuthenticated: true, user: { id: 'u1', username: 'javi' } }
    vi.mocked(getBoardGame).mockResolvedValue(base)
    vi.mocked(listBoardGames).mockResolvedValue(page([expansion]))
    vi.mocked(getExpansions).mockResolvedValue({ baseGameId: 'bg1', baseBggId: '13', expansions: [] })
    vi.mocked(addExpansions).mockResolvedValue({ created: [], skipped: [] })
  })

  it('en un base tuyo en propiedad muestra el bloque Expansiones con enlaces y el botón', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Expansiones' })).toBeInTheDocument()

    const enlace = await screen.findByRole('link', { name: 'Catan: Navegantes' })
    expect(enlace).toHaveAttribute('href', '/boardgames/ex1')
    expect(listBoardGames).toHaveBeenCalledWith(expect.objectContaining({ type: 'expansion' }))

    expect(screen.getByRole('button', { name: 'Añadir expansiones' })).toBeInTheDocument()
  })

  it('si el juego es una expansión muestra «Expansión de» con enlace al base y oculta el bloque', async () => {
    vi.mocked(getBoardGame).mockResolvedValue({ ...expansion })
    renderPage('ex1')

    const parent = await screen.findByRole('link', { name: 'Catan' })
    expect(parent).toHaveAttribute('href', '/boardgames/bg1')
    expect(screen.getByText(/Expansión de/)).toBeInTheDocument()

    expect(screen.queryByRole('heading', { name: 'Expansiones' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir expansiones' })).not.toBeInTheDocument()
    expect(listBoardGames).not.toHaveBeenCalled()
  })

  it('no ofrece añadir si el base está en lista de deseos', async () => {
    vi.mocked(getBoardGame).mockResolvedValue({ ...base, status: BoardGameStatus.WISHLIST })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Expansiones' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir expansiones' })).not.toBeInTheDocument()
  })

  it('no ofrece añadir si el juego es de otro usuario', async () => {
    vi.mocked(getBoardGame).mockResolvedValue({ ...base, userOwned: { username: 'otro' } })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Expansiones' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir expansiones' })).not.toBeInTheDocument()
  })

  it('el diálogo añade las seleccionadas y refresca el bloque', async () => {
    vi.mocked(getExpansions).mockResolvedValue({
      baseGameId: 'bg1',
      baseBggId: '13',
      expansions: [{ bggId: '926', title: 'Catan: Navegantes', yearPublished: 1997, inCollection: false }],
    })
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Añadir expansiones' }))
    expect(screen.getByRole('dialog', { name: 'Añadir expansiones' })).toBeInTheDocument()

    const checkbox = await screen.findByRole('checkbox', { name: 'Catan: Navegantes' })
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    await waitFor(() => expect(addExpansions).toHaveBeenCalledWith('bg1', ['926']))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Añadir expansiones' })).not.toBeInTheDocument())
    await waitFor(() => expect(listBoardGames).toHaveBeenCalledTimes(2))
  })
})
