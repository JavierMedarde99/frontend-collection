import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameListPage from '../pages/GameListPage'
import { useAuth } from '../context/AuthContext'
import { listGames } from '../api/gamesApi'

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
  listGamePlatforms: vi.fn(async () => [
    { id: 1, name: 'PC', slug: 'pc' },
    { id: 2, name: 'PlayStation 5', slug: 'ps5' },
  ]),
  listGameGenres: vi.fn(async () => []),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedListGames = vi.mocked(listGames)

async function openFilters() {
  await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
}

function platformFilter() {
  return screen.getByRole('combobox', { name: 'Filtrar por plataforma' }) as HTMLInputElement
}

function optionTexts() {
  return within(screen.getByRole('listbox')).getAllByRole('option').map((o) => o.textContent)
}

/** Última llamada a listGames: es la que refleja el filtro aplicado. */
function lastPlatformParam(): string[] | undefined {
  const calls = mockedListGames.mock.calls
  return calls[calls.length - 1]?.[0]?.platform
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } } as never)
})

function renderPage(path = '/juegos') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameListPage />
    </MemoryRouter>,
  )
}

describe('GameListPage filtro de plataformas', () => {
  it('ofrece el catálogo del backend más la opción de todas', async () => {
    renderPage()
    await openFilters()
    await userEvent.click(platformFilter())

    await waitFor(() =>
      expect(optionTexts()).toEqual(['Todas las plataformas', 'PC', 'PlayStation 5']),
    )
  })

  it('mantiene en el desplegable un filtro activo que el catálogo ya no lista', async () => {
    renderPage('/juegos?platform=WII_U')
    await openFilters()

    // Sin esto el filtro se perdería y no habría forma de volver a él.
    expect(platformFilter()).toHaveValue('Wii U')
    await userEvent.click(platformFilter())
    await waitFor(() => expect(optionTexts()).toContain('Wii U'))
    expect(screen.getByRole('checkbox', { name: 'Wii U' })).toBeChecked()
  })

  it('permite marcar varias plataformas y las pide todas juntas', async () => {
    renderPage()
    await openFilters()
    await userEvent.click(platformFilter())

    await userEvent.click(screen.getByRole('checkbox', { name: 'PC' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'PlayStation 5' }))

    await waitFor(() => expect(lastPlatformParam()).toEqual(['PC', 'PlayStation 5']))
  })

  it('parte de varias plataformas de la URL y «Todas las plataformas» las limpia', async () => {
    renderPage('/juegos?platform=PC&platform=PlayStation%205')
    await openFilters()

    expect(platformFilter()).toHaveValue('PC, PlayStation 5')

    await userEvent.click(platformFilter())
    await userEvent.click(screen.getByRole('checkbox', { name: 'Todas las plataformas' }))

    await waitFor(() => expect(lastPlatformParam()).toBeUndefined())
    expect(platformFilter()).toHaveValue('')
  })

  it('escribir en el buscador filtra la lista y no cambia el filtro aplicado', async () => {
    renderPage()
    await openFilters()
    const input = platformFilter()
    await userEvent.click(input)

    await userEvent.type(input, 'play')

    expect(optionTexts()).toEqual(['Todas las plataformas', 'PlayStation 5'])
    expect(lastPlatformParam()).toBeUndefined()
  })
})
