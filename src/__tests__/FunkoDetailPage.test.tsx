import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FunkoDetailPage from '../pages/FunkoDetailPage'
import { getFunko, deleteFunko } from '../api/funkosApi'
import { FunkoStatus } from '../types'
import type { Funko } from '../types'

vi.mock('../api/funkosApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/funkosApi')>()),
  getFunko: vi.fn(),
  deleteFunko: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { username: 'javi' } }),
}))

const mockedGet = vi.mocked(getFunko)
const mockedDelete = vi.mocked(deleteFunko)

function funkoWith(overrides: Partial<Funko> = {}): Funko {
  return {
    id: 'f1',
    externalId: 'ext-1',
    name: 'Spider-Man',
    series: 'Marvel',
    number: '123',
    status: FunkoStatus.OWNED,
    acquisitionDate: '2024-05-01',
    acquisitionPrice: 24.99,
    userOwned: { username: 'javi', ownerName: 'javi' },
    ...overrides,
  }
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/figuras/funkopop/f1']}>
      <Routes>
        <Route path="/figuras/funkopop/:id" element={<FunkoDetailPage />} />
        <Route path="/figuras/funkopop" element={<div>Lista Funko</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FunkoDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el nombre y los datos de la pieza', async () => {
    mockedGet.mockResolvedValue(funkoWith())
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Spider-Man' })).toBeInTheDocument()
    expect(screen.getByText('Marvel')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it('muestra la fecha y el precio de adquisición', async () => {
    mockedGet.mockResolvedValue(funkoWith())
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Spider-Man' })).toBeInTheDocument()
    expect(screen.getByText('Fecha de obtención')).toBeInTheDocument()
    expect(screen.getByText('2024-05-01')).toBeInTheDocument()
    expect(screen.getByText('Precio de adquisición')).toBeInTheDocument()
    expect(screen.getByText('24.99 €')).toBeInTheDocument()
  })

  it('no muestra el precio de adquisición si está en lista de deseos aunque tenga precio guardado', async () => {
    mockedGet.mockResolvedValue(funkoWith({ status: FunkoStatus.WISHLIST }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Spider-Man' })).toBeInTheDocument()
    expect(screen.queryByText('Precio de adquisición')).not.toBeInTheDocument()
    expect(screen.queryByText('24.99 €')).not.toBeInTheDocument()
  })

  it('ofrece Editar y Eliminar cuando es tu pieza', async () => {
    mockedGet.mockResolvedValue(funkoWith())
    renderDetail()

    expect(await screen.findByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/figuras/funkopop/f1/editar',
    )
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('no ofrece acciones sobre piezas de otros usuarios', async () => {
    mockedGet.mockResolvedValue(funkoWith({ userOwned: { username: 'otro', ownerName: 'otro' } }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Spider-Man' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull()
  })

  it('elimina la pieza tras confirmar y navega a la lista', async () => {
    mockedGet.mockResolvedValue(funkoWith())
    mockedDelete.mockResolvedValue(null)
    renderDetail()

    await screen.findByRole('heading', { name: 'Spider-Man' })
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith('f1'))
    expect(await screen.findByText('Lista Funko')).toBeInTheDocument()
  })
})
