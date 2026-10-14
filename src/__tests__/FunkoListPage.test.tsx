import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FunkoListPage from '../pages/FunkoListPage'
import { listFunkos } from '../api/funkosApi'
import { useAuth } from '../context/AuthContext'
import { FunkoStatus, type Funko } from '../types'

vi.mock('../api/funkosApi', () => ({ listFunkos: vi.fn() }))
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const mockedList = vi.mocked(listFunkos)
const mockedUseAuth = vi.mocked(useAuth)

function funkoWith(overrides: Partial<Funko> = {}): Funko {
  return {
    id: 'f1',
    externalId: 'ext-1',
    name: 'Spider-Man',
    series: 'Marvel',
    number: '123',
    status: FunkoStatus.OWNED,
    ...overrides,
  }
}

function pageOf(content: Funko[]) {
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
      <FunkoListPage />
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

describe('FunkoListPage', () => {
  it('muestra el estado vacío cuando no hay Funkos', async () => {
    renderPage()

    expect(await screen.findByText('Aún no tienes Funko Pop')).toBeInTheDocument()
  })

  it('pinta una tarjeta por cada Funko', async () => {
    mockedList.mockResolvedValue(pageOf([funkoWith()]))
    renderPage()

    expect(await screen.findByText('Spider-Man')).toBeInTheDocument()
  })

  it('al cambiar el filtro de estado refetchea con ese estado', async () => {
    renderPage()
    await screen.findByText('Aún no tienes Funko Pop')

    await userEvent.click(screen.getByRole('button', { name: 'Filtrar por estado: Lista de deseos' }))

    await waitFor(() =>
      expect(mockedList).toHaveBeenCalledWith(
        expect.objectContaining({ status: FunkoStatus.WISHLIST }),
      ),
    )
  })
})
