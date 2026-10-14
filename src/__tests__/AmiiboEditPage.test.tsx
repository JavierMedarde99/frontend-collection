import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AmiiboEditPage from '../pages/AmiiboEditPage'
import { getAmiibo, updateAmiibo, deleteAmiibo } from '../api/amiibosApi'
import { AmiiboStatus } from '../types'
import type { Amiibo } from '../types'

vi.mock('../api/amiibosApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/amiibosApi')>()),
  getAmiibo: vi.fn(),
  updateAmiibo: vi.fn(),
  deleteAmiibo: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { username: 'javi' } }),
}))

const mockedGet = vi.mocked(getAmiibo)
const mockedUpdate = vi.mocked(updateAmiibo)
const mockedDelete = vi.mocked(deleteAmiibo)

function amiiboWith(overrides: Partial<Amiibo> = {}): Amiibo {
  return {
    id: 'a1',
    externalId: 'ext-a1',
    name: 'Mario',
    character: 'Mario Bros.',
    amiiboSeries: 'Super Smash Bros.',
    gameSeries: 'Super Mario',
    status: AmiiboStatus.OWNED,
    ...overrides,
  }
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/figuras/amiibo/a1/editar']}>
      <Routes>
        <Route path="/figuras/amiibo/:id/editar" element={<AmiiboEditPage />} />
        <Route path="/figuras/amiibo" element={<div>Lista Amiibo</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AmiiboEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('precarga el formulario con los datos actuales', async () => {
    mockedGet.mockResolvedValue(amiiboWith())
    renderEdit()

    expect(await screen.findByDisplayValue('Mario')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mario Bros.')).toBeInTheDocument()
  })

  it('guarda los cambios y vuelve a la lista', async () => {
    mockedGet.mockResolvedValue(amiiboWith())
    mockedUpdate.mockResolvedValue(amiiboWith())
    renderEdit()

    await screen.findByDisplayValue('Mario')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith('a1', expect.objectContaining({ name: 'Mario' })),
    )
    expect(await screen.findByText('Lista Amiibo')).toBeInTheDocument()
  })

  it('permite eliminar la pieza desde la edición', async () => {
    mockedGet.mockResolvedValue(amiiboWith())
    mockedDelete.mockResolvedValue(null)
    renderEdit()

    await screen.findByDisplayValue('Mario')
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith('a1'))
    expect(await screen.findByText('Lista Amiibo')).toBeInTheDocument()
  })
})
