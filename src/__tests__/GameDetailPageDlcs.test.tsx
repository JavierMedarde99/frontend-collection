import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameDetailPage from '../pages/GameDetailPage'
import { addGameAdditions, getGame, getGameAdditions, listGames } from '../api/gamesApi'
import { RequestError } from '../api/errors'
import { GameStatus, type Game, type GameAdditionList, type PageGameResponse } from '../types'

const { authState } = vi.hoisted(() => ({
  authState: {
    value: { isAuthenticated: true, user: { id: 'u1', username: 'javi' } } as {
      isAuthenticated: boolean
      user: { id?: string; username: string } | null
    },
  },
}))

vi.mock('../api/gamesApi', () => ({
  getGame: vi.fn(),
  deleteGame: vi.fn(),
  listGames: vi.fn(),
  getGameAdditions: vi.fn(),
  addGameAdditions: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({ useAuth: () => authState.value }))

const base: Game = {
  id: 'g1',
  title: 'The Witcher 3',
  platform: 'PC',
  status: GameStatus.OWNED,
  externalId: '292030',
  externalSource: 'RAWG',
  userOwned: { username: 'javi' },
}

const dlc: Game = {
  id: 'd1',
  title: 'Blood and Wine',
  platform: 'PC',
  status: GameStatus.COMPLETED,
  parentId: 'g1',
  parentTitle: 'The Witcher 3',
  userOwned: { username: 'javi' },
}

const catalogo: GameAdditionList = {
  baseGameId: 'g1',
  baseExternalId: '292030',
  additions: [
    {
      externalId: '3',
      title: 'GOTY Edition',
      genres: ['RPG'],
      inCollection: false,
      alreadyLinked: false,
    },
  ],
  totalAvailable: 1,
}

function page(content: Game[]): PageGameResponse {
  return {
    content,
    totalPages: 1,
    totalElements: content.length,
    number: 0,
    size: 100,
    empty: content.length === 0,
  }
}

function renderPage(id = 'g1') {
  return render(
    <MemoryRouter initialEntries={[`/juegos/${id}`]}>
      <Routes>
        <Route path="/juegos/:id" element={<GameDetailPage />} />
        <Route path="/juegos/:id/editar" element={<p>Editar</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GameDetailPage contenido adicional', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.value = { isAuthenticated: true, user: { id: 'u1', username: 'javi' } }
    vi.mocked(getGame).mockResolvedValue(base)
    vi.mocked(listGames).mockResolvedValue(page([dlc]))
    vi.mocked(getGameAdditions).mockResolvedValue(catalogo)
    vi.mocked(addGameAdditions).mockResolvedValue({ created: [], linked: [], skipped: [] })
  })

  it('en un base tuyo de RAWG muestra el bloque con enlaces y el botón de alta', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Contenido adicional' })).toBeInTheDocument()

    const enlace = await screen.findByRole('link', { name: /Blood and Wine/ })
    expect(enlace).toHaveAttribute('href', '/juegos/d1')
    expect(listGames).toHaveBeenCalledWith(expect.objectContaining({ type: 'dlc' }))

    expect(screen.getByRole('button', { name: 'Añadir contenido adicional' })).toBeInTheDocument()
  })

  it('si el juego es un DLC muestra «Contenido adicional de» con enlace al base y oculta el bloque', async () => {
    vi.mocked(getGame).mockResolvedValue(dlc)
    renderPage('d1')

    const parent = await screen.findByRole('link', { name: 'The Witcher 3' })
    expect(parent).toHaveAttribute('href', '/juegos/g1')
    expect(screen.getByText(/Contenido adicional de/)).toBeInTheDocument()

    expect(screen.queryByRole('heading', { name: 'Contenido adicional' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir contenido adicional' })).not.toBeInTheDocument()
    expect(listGames).not.toHaveBeenCalled()
  })

  it('no ofrece añadir si el base está en lista de deseos', async () => {
    vi.mocked(getGame).mockResolvedValue({ ...base, status: GameStatus.WISHLIST })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Contenido adicional' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir contenido adicional' })).not.toBeInTheDocument()
  })

  it('no ofrece añadir si el juego es de otro usuario', async () => {
    vi.mocked(getGame).mockResolvedValue({ ...base, userOwned: { username: 'otro' } })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Contenido adicional' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir contenido adicional' })).not.toBeInTheDocument()
  })

  it('no ofrece añadir si el juego no viene de RAWG', async () => {
    vi.mocked(getGame).mockResolvedValue({ ...base, externalSource: 'FreeToGame' })
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Contenido adicional' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir contenido adicional' })).not.toBeInTheDocument()
  })

  it('el diálogo añade las seleccionadas con su estado y datos, y refresca el bloque', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Añadir contenido adicional' }))
    expect(screen.getByRole('dialog', { name: 'Añadir contenido adicional' })).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Estado de GOTY Edition' }), {
      target: { value: GameStatus.PLAYING },
    })
    fireEvent.change(screen.getByLabelText('Precio de GOTY Edition'), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    await waitFor(() =>
      expect(addGameAdditions).toHaveBeenCalledWith('g1', [
        expect.objectContaining({
          externalId: '3',
          status: GameStatus.PLAYING,
          acquisitionPrice: 12,
        }),
      ]),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Añadir contenido adicional' })).not.toBeInTheDocument(),
    )
    await waitFor(() => expect(listGames).toHaveBeenCalledTimes(2))
  })

  it('si el backend rechaza el alta muestra su mensaje dentro del diálogo y no lo cierra', async () => {
    vi.mocked(addGameAdditions).mockRejectedValue(
      new RequestError('El juego base está en WISHLIST: no admite contenido adicional', 422),
    )
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: 'Añadir contenido adicional' }))
    fireEvent.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))
    fireEvent.change(screen.getByLabelText('Precio de GOTY Edition'), { target: { value: '12' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    const dialog = await screen.findByRole('dialog', { name: 'Añadir contenido adicional' })
    await waitFor(() =>
      expect(within(dialog).getByText(/El juego base está en WISHLIST/)).toBeInTheDocument(),
    )
    expect(dialog).toBeInTheDocument()
  })

  it('si falla la carga del bloque muestra el error sin romper la ficha', async () => {
    vi.mocked(listGames).mockRejectedValue(new Error('No se pudo listar'))
    renderPage()

    expect(await screen.findByText('No se pudo listar')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The Witcher 3' })).toBeInTheDocument()
  })
})
