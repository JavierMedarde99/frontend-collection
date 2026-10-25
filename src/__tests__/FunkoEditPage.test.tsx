import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FunkoEditPage from '../pages/FunkoEditPage'
import { getFunko, updateFunko, deleteFunko } from '../api/funkosApi'
import { FunkoStatus } from '../types'
import type { Funko } from '../types'

vi.mock('../api/funkosApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/funkosApi')>()),
  getFunko: vi.fn(),
  updateFunko: vi.fn(),
  deleteFunko: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { username: 'javi' } }),
}))

const mockedGet = vi.mocked(getFunko)
const mockedUpdate = vi.mocked(updateFunko)
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
    ...overrides,
  }
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/figuras/funkopop/f1/editar']}>
      <Routes>
        <Route path="/figuras/funkopop/:id/editar" element={<FunkoEditPage />} />
        <Route path="/figuras/funkopop" element={<div>Lista Funko</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FunkoEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('precarga el formulario con los datos actuales', async () => {
    mockedGet.mockResolvedValue(funkoWith())
    renderEdit()

    expect(await screen.findByDisplayValue('Spider-Man')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Marvel')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-05-01')).toBeInTheDocument()
  })

  it('exige la fecha de obtención cuando la pieza está en propiedad', async () => {
    mockedGet.mockResolvedValue(funkoWith({ acquisitionDate: undefined }))
    renderEdit()

    await screen.findByDisplayValue('Spider-Man')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de obtención es obligatoria.')
    expect(mockedUpdate).not.toHaveBeenCalled()
  })

  it('guarda los cambios y vuelve a la lista', async () => {
    mockedGet.mockResolvedValue(funkoWith())
    mockedUpdate.mockResolvedValue(funkoWith())
    renderEdit()

    await screen.findByDisplayValue('Spider-Man')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(mockedUpdate).toHaveBeenCalledWith(
        'f1',
        expect.objectContaining({ name: 'Spider-Man', acquisitionDate: '2024-05-01' }),
      ),
    )
    expect(await screen.findByText('Lista Funko')).toBeInTheDocument()
  })

  it('permite eliminar la pieza desde la edición', async () => {
    mockedGet.mockResolvedValue(funkoWith())
    mockedDelete.mockResolvedValue(null)
    renderEdit()

    await screen.findByDisplayValue('Spider-Man')
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith('f1'))
    expect(await screen.findByText('Lista Funko')).toBeInTheDocument()
  })
})
