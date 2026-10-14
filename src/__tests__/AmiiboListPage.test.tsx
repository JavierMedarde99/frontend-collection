import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AmiiboListPage from '../pages/AmiiboListPage'
import { listAmiibos } from '../api/amiibosApi'
import { useAuth } from '../context/AuthContext'
import { AmiiboStatus, type Amiibo } from '../types'

vi.mock('../api/amiibosApi', () => ({ listAmiibos: vi.fn() }))
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const mockedList = vi.mocked(listAmiibos)
const mockedUseAuth = vi.mocked(useAuth)

function amiiboWith(overrides: Partial<Amiibo> = {}): Amiibo {
  return {
    id: 'a1',
    externalId: 'ext-1',
    name: 'Kirby',
    character: 'Dream Land',
    amiiboSeries: 'Super Smash Bros.',
    status: AmiiboStatus.OWNED,
    ...overrides,
  }
}

function pageOf(content: Amiibo[]) {
  return {
    content,
    totalPages: 1,
    totalElements: content.length,
    number: 0,
    size: 12,
    empty: content.length === 0,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AmiiboListPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  mockedUseAuth.mockReturnValue({ isAuthenticated: true, user: { id: 'u1' } } as never)
  mockedList.mockResolvedValue(pageOf([]))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AmiiboListPage', () => {
  it('muestra el estado vacío cuando no hay Amiibos', async () => {
    renderPage()

    expect(await screen.findByText('Aún no tienes Amiibo')).toBeInTheDocument()
  })

  it('pinta una tarjeta por cada Amiibo', async () => {
    mockedList.mockResolvedValue(pageOf([amiiboWith()]))
    renderPage()

    expect(await screen.findByText('Kirby')).toBeInTheDocument()
  })

  it('al cambiar el filtro de estado refetchea con ese estado', async () => {
    renderPage()
    await screen.findByText('Aún no tienes Amiibo')

    await userEvent.click(screen.getByRole('button', { name: 'Filtrar por estado: Lista de deseos' }))

    await waitFor(() =>
      expect(mockedList).toHaveBeenCalledWith(
        expect.objectContaining({ status: AmiiboStatus.WISHLIST }),
      ),
    )
  })
})
