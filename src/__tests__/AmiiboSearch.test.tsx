import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AmiiboSearch from '../components/AmiiboSearch'
import { createAmiibo, searchAmiibosPage } from '../api/amiibosApi'
import { AmiiboStatus } from '../types'

vi.mock('../api/amiibosApi', () => ({
  searchAmiibosPage: vi.fn(),
  createAmiibo: vi.fn(),
}))

const mockedSearch = vi.mocked(searchAmiibosPage)
const mockedCreate = vi.mocked(createAmiibo)

const marioResult = {
  externalId: 'amiibo-1',
  name: 'Mario',
  character: 'Mario',
  amiiboSeries: 'Super Smash Bros.',
  gameSeries: 'Super Mario',
  imageUrl: 'https://img/a.jpg',
}

function renderSearch() {
  return render(
    <MemoryRouter initialEntries={['/figuras/amiibo/nuevo']}>
      <Routes>
        <Route path="/figuras/amiibo/nuevo" element={<AmiiboSearch />} />
        <Route path="/figuras/amiibo" element={<p>Listado Amiibo</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AmiiboSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    mockedSearch.mockResolvedValue({ content: [marioResult], totalPages: 1, totalElements: 1, number: 0, size: 10, empty: false })
    mockedCreate.mockResolvedValue({ id: '9', name: 'Mario', status: AmiiboStatus.OWNED } as never)
  })

  it('con consulta vacía no llama a la API', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('muestra un aviso de que la búsqueda es por nombre, no por serie', () => {
    renderSearch()

    expect(screen.getByText(/no por serie de juego/i)).toBeInTheDocument()
  })

  it('con consulta no vacía busca y pinta resultados', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByLabelText('Buscar por nombre'), 'Mario')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByText('Mario')).toBeInTheDocument()
    await waitFor(() => expect(mockedSearch).toHaveBeenCalledWith('Mario', 0, 10))
  })

  it('elegir y confirmar llama a createAmiibo con el externalId del resultado y navega', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByLabelText('Buscar por nombre'), 'Mario')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          externalId: 'amiibo-1',
          name: 'Mario',
          acquisitionDate: expect.any(String),
        }),
      ),
    )
    expect(await screen.findByText('Listado Amiibo')).toBeInTheDocument()
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})
