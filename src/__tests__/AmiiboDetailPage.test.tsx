import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AmiiboDetailPage from '../pages/AmiiboDetailPage'
import { getAmiibo, deleteAmiibo } from '../api/amiibosApi'
import { AmiiboStatus } from '../types'
import type { Amiibo } from '../types'

vi.mock('../api/amiibosApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/amiibosApi')>()),
  getAmiibo: vi.fn(),
  deleteAmiibo: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { username: 'javi' } }),
}))

const mockedGet = vi.mocked(getAmiibo)
const mockedDelete = vi.mocked(deleteAmiibo)

function amiiboWith(overrides: Partial<Amiibo> = {}): Amiibo {
  return {
    id: 'a1',
    externalId: 'ext-a1',
    name: 'Mario',
    character: 'Mario',
    amiiboSeries: 'Super Smash Bros.',
    gameSeries: 'Super Mario',
    status: AmiiboStatus.OWNED,
    acquisitionDate: '2024-05-01',
    acquisitionPrice: 14.5,
    userOwned: { username: 'javi', ownerName: 'javi' },
    ...overrides,
  }
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/figuras/amiibo/a1']}>
      <Routes>
        <Route path="/figuras/amiibo/:id" element={<AmiiboDetailPage />} />
        <Route path="/figuras/amiibo" element={<div>Lista Amiibo</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AmiiboDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el nombre y los datos de la pieza', async () => {
    mockedGet.mockResolvedValue(amiiboWith())
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Mario' })).toBeInTheDocument()
    expect(screen.getByText('Super Smash Bros.')).toBeInTheDocument()
    expect(screen.getByText('Super Mario')).toBeInTheDocument()
  })

  it('muestra la fecha y el precio de adquisición', async () => {
    mockedGet.mockResolvedValue(amiiboWith())
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Mario' })).toBeInTheDocument()
    expect(screen.getByText('Fecha de obtención')).toBeInTheDocument()
    expect(screen.getByText('2024-05-01')).toBeInTheDocument()
    expect(screen.getByText('Precio de adquisición')).toBeInTheDocument()
    expect(screen.getByText('14.5 €')).toBeInTheDocument()
  })

  it('ofrece Editar y Eliminar cuando es tu pieza', async () => {
    mockedGet.mockResolvedValue(amiiboWith())
    renderDetail()

    expect(await screen.findByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/figuras/amiibo/a1/editar',
    )
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('no ofrece acciones sobre piezas de otros usuarios', async () => {
    mockedGet.mockResolvedValue(amiiboWith({ userOwned: { username: 'otro', ownerName: 'otro' } }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Mario' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Editar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull()
  })

  it('elimina la pieza tras confirmar y navega a la lista', async () => {
    mockedGet.mockResolvedValue(amiiboWith())
    mockedDelete.mockResolvedValue(null)
    renderDetail()

    await screen.findByRole('heading', { name: 'Mario' })
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith('a1'))
    expect(await screen.findByText('Lista Amiibo')).toBeInTheDocument()
  })
})
