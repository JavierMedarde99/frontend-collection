import { render, screen } from '@testing-library/react'
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
}))

import { searchGamesPage } from '../api/gamesApi'

const mockedUseAuth = vi.mocked(useAuth)
const mockedSearch = vi.mocked(searchGamesPage)

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
