import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameListPage from '../pages/GameListPage'
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
  listGamePlatforms: vi.fn(async () => [
    { id: 1, name: 'PC', slug: 'pc' },
    { id: 2, name: 'PlayStation 5', slug: 'ps5' },
  ]),
  listGameGenres: vi.fn(async () => []),
}))

const mockedUseAuth = vi.mocked(useAuth)

async function openFilters() {
  await userEvent.click(screen.getByRole('button', { name: /filtros/i }))
}

function platformFilterSelect() {
  return screen.getByLabelText('Filtrar por plataforma') as HTMLSelectElement
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } } as never)
})

describe('GameListPage filtro de plataformas', () => {
  it('ofrece el catálogo del backend más la opción de todas', async () => {
    render(
      <MemoryRouter initialEntries={['/juegos']}>
        <GameListPage />
      </MemoryRouter>,
    )

    await openFilters()
    await waitFor(() => expect(platformFilterSelect().options.length).toBe(3))
    expect([...platformFilterSelect().options].map((o) => o.textContent)).toEqual([
      'Todas las plataformas',
      'PC',
      'PlayStation 5',
    ])
  })

  it('mantiene en el desplegable un filtro activo que el catálogo ya no lista', async () => {
    render(
      <MemoryRouter initialEntries={['/juegos?platform=WII_U']}>
        <GameListPage />
      </MemoryRouter>,
    )

    await openFilters()
    // Sin esto el filtro quedaría en un valor sin opción y el select se mostraría vacío.
    expect(platformFilterSelect().value).toBe('WII_U')
    await waitFor(() => expect([...platformFilterSelect().options].map((o) => o.value)).toContain('WII_U'))
  })
})