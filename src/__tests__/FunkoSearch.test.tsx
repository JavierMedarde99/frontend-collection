import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FunkoSearch from '../components/FunkoSearch'
import { createFunko, searchFunkosPage } from '../api/funkosApi'
import { FunkoStatus } from '../types'

vi.mock('../api/funkosApi', () => ({
  searchFunkosPage: vi.fn(),
  createFunko: vi.fn(),
}))

const mockedSearch = vi.mocked(searchFunkosPage)
const mockedCreate = vi.mocked(createFunko)

const batmanResult = {
  externalId: 'funko-1',
  name: 'Batman',
  series: 'Heroes',
  number: '25',
  releaseYear: 2019,
  imageUrl: 'https://img/f.jpg',
}

function renderSearch() {
  return render(
    <MemoryRouter initialEntries={['/figuras/funkopop/nuevo']}>
      <Routes>
        <Route path="/figuras/funkopop/nuevo" element={<FunkoSearch />} />
        <Route path="/figuras/funkopop" element={<p>Listado Funko</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FunkoSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    mockedSearch.mockResolvedValue({ content: [batmanResult], totalPages: 1, totalElements: 1, number: 0, size: 10, empty: false })
    mockedCreate.mockResolvedValue({ id: '9', name: 'Batman', status: FunkoStatus.OWNED } as never)
  })

  it('con 1 carácter no llama a la API y avisa', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByPlaceholderText('Buscar por nombre…'), 'B')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Escribe al menos 2 caracteres.')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('con 2 o más caracteres busca y pinta resultados', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByPlaceholderText('Buscar por nombre…'), 'Batman')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByText('Batman')).toBeInTheDocument()
    await waitFor(() => expect(mockedSearch).toHaveBeenCalledWith('Batman', 0, 10))
  })

  it('elegir y confirmar llama a createFunko con el externalId del resultado y navega', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByPlaceholderText('Buscar por nombre…'), 'Batman')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({ externalId: 'funko-1', name: 'Batman' }),
      ),
    )
    expect(await screen.findByText('Listado Funko')).toBeInTheDocument()
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})
