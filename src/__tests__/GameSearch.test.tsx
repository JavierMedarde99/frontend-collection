import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GameSearch from '../components/GameSearch'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../api/gamesApi', () => ({
  searchGamesPage: vi.fn(),
  createGame: vi.fn(),
  listGamePlatforms: vi.fn(async () => [
    { id: 1, name: 'PC', slug: 'pc' },
    { id: 2, name: 'PlayStation 5', slug: 'ps5' },
  ]),
}))

import { searchGamesPage, createGame } from '../api/gamesApi'

const mockedUseAuth = vi.mocked(useAuth)
const mockedSearch = vi.mocked(searchGamesPage)
const mockedCreate = vi.mocked(createGame)

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderSearch(steamId?: string) {
  mockedUseAuth.mockReturnValue({ user: steamId ? { steamId } : null } as never)
  mockedSearch.mockResolvedValue({
    content: [{ id: 's1', title: 'Hades', platform: 'PC' }],
    totalPages: 1,
  } as never)
  return render(<GameSearch />)
}

async function openAddModal() {
  await userEvent.type(screen.getByRole('textbox', { name: 'Búsqueda' }), 'hades')
  await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('GameSearch platinar', () => {
  it('oculta Platinar si el usuario no tiene steamId', async () => {
    renderSearch(undefined)
    await openAddModal()
    expect(screen.queryByLabelText(/Platinar/)).not.toBeInTheDocument()
  })

  it('muestra Platinar si el usuario tiene steamId', async () => {
    renderSearch('76561198000000000')
    await openAddModal()
    expect(screen.getByLabelText(/Platinar/)).toBeInTheDocument()
  })

  it('propone hoy como fecha de inicio al elegir PLAYING', async () => {
    renderSearch('76561198000000000')
    await openAddModal()

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), 'PLAYING')
    expect(screen.getByLabelText(/Fecha de inicio/)).toHaveValue(
      new Date().toISOString().slice(0, 10),
    )
  })

  it('no deja añadir PLAYING sin fecha de inicio', async () => {
    renderSearch('76561198000000000')
    await openAddModal()

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), 'PLAYING')
    await userEvent.clear(screen.getByLabelText(/Fecha de inicio/))
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de inicio es obligatoria.')
  })

  it('no deja añadir COMPLETED sin fecha de fin', async () => {
    renderSearch('76561198000000000')
    await openAddModal()

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), 'COMPLETED')
    await userEvent.clear(screen.getByLabelText(/Fecha de fin/))
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de fin es obligatoria.')
  })
})

describe('GameSearch adquisición', () => {
  it('en Lista de deseos no muestra la adquisición', async () => {
    renderSearch('76561198000000000')
    await openAddModal()

    expect(screen.queryByLabelText(/Fecha de obtención/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Precio de adquisición/)).not.toBeInTheDocument()
  })

  it('propone hoy como fecha de obtención al elegir En posesión', async () => {
    renderSearch('76561198000000000')
    await openAddModal()

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), 'OWNED')
    expect(screen.getByLabelText(/Fecha de obtención/)).toHaveValue(
      new Date().toISOString().slice(0, 10),
    )
    expect(screen.getByLabelText(/Precio de adquisición/)).toBeInTheDocument()
  })

  it('no deja añadir En posesión sin precio de adquisición', async () => {
    renderSearch('76561198000000000')
    await openAddModal()

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), 'OWNED')
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El precio de adquisición es obligatorio.')
  })

  it('al añadir en En posesión envía la fecha y el precio de adquisición', async () => {
    renderSearch('76561198000000000')
    await openAddModal()

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), 'OWNED')
    await userEvent.type(screen.getByLabelText(/Precio de adquisición/), '24.99')
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'OWNED',
          acquisitionDate: new Date().toISOString().slice(0, 10),
          acquisitionPrice: 24.99,
        }),
      ),
    )
  })
})
