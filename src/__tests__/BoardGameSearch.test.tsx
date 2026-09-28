import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BoardGameSearch from '../components/BoardGameSearch'
import { createBoardGame, searchBoardGamesPage } from '../api/boardgamesApi'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../api/boardgamesApi', () => ({
  searchBoardGamesPage: vi.fn(),
  createBoardGame: vi.fn(),
}))

const mockedSearch = vi.mocked(searchBoardGamesPage)
const mockedCreate = vi.mocked(createBoardGame)

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  mockedSearch.mockResolvedValue({
    content: [{ bggId: '13', title: 'Catan' }],
    totalPages: 1,
  } as never)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function openAddModal() {
  const user = userEvent.setup()
  render(<BoardGameSearch />)
  await user.type(screen.getByPlaceholderText('Buscar por título…'), 'catan')
  await user.click(screen.getByRole('button', { name: 'Buscar' }))
  await user.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))
}

describe('BoardGameSearch fechas obligatorias', () => {
  it('propone hoy como fecha de adición al abrir el modal', async () => {
    await openAddModal()
    expect(screen.getByLabelText(/Fecha de adición/)).toHaveValue(
      new Date().toISOString().slice(0, 10),
    )
  })

  it('no deja añadir sin fecha de adición', async () => {
    const user = userEvent.setup()
    await openAddModal()

    await user.clear(screen.getByLabelText(/Fecha de adición/))
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de adición es obligatoria.')
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('no deja añadir con jugadas si falta la última jugada', async () => {
    const user = userEvent.setup()
    await openAddModal()

    await user.type(screen.getByPlaceholderText('Ej: 12'), '5')
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La fecha de la última jugada es obligatoria.',
    )
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('sí deja añadir sin última jugada cuando no hay jugadas', async () => {
    const user = userEvent.setup()
    await openAddModal()

    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(mockedCreate).toHaveBeenCalledTimes(1)
    const payload = mockedCreate.mock.calls[0]![0]
    expect(payload.lastPlayedDate).toBeUndefined()
    expect(payload.dateAdded).toBe(new Date().toISOString().slice(0, 10))
  })
})