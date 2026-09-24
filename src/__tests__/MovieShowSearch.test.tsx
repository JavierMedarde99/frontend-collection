import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MovieShowSearch from '../components/MovieShowSearch'
import { createMovieShow, refreshMovieShowProviders, searchMovieShowsPage } from '../api/movieshowsApi'
import { MediaType } from '../types'
import { MovieShowStatus } from '../types/MovieShowStatus'

vi.mock('../api/movieshowsApi', () => ({
  searchMovieShowsPage: vi.fn(),
  createMovieShow: vi.fn(),
  refreshMovieShowProviders: vi.fn(),
}))

const mockedSearch = vi.mocked(searchMovieShowsPage)
const mockedCreate = vi.mocked(createMovieShow)
const mockedRefresh = vi.mocked(refreshMovieShowProviders)

const duneResult = {
  externalId: 'tmdb-438631',
  title: 'Dune',
  overview: 'Arrakis.',
  releaseDate: '2021-09-15',
  posterUrl: 'https://img/p.jpg',
  voteAverage: 8,
  mediaType: MediaType.MOVIE,
}

function renderSearch() {
  return render(
    <MemoryRouter initialEntries={['/movieshows/nuevo']}>
      <Routes>
        <Route path="/movieshows/nuevo" element={<MovieShowSearch />} />
        <Route path="/movieshows" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MovieShowSearch proveedores', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    mockedSearch.mockResolvedValue({ content: [duneResult], totalPages: 1, totalElements: 1, number: 0, size: 10, empty: false })
    mockedCreate.mockResolvedValue({ id: '9', title: 'Dune', mediaType: MediaType.MOVIE, status: MovieShowStatus.PLAN_TO_WATCH } as never)
    mockedRefresh.mockResolvedValue({} as never)
  })

  async function addDune() {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByPlaceholderText('Buscar por título…'), 'Dune')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))
    await user.click(screen.getByRole('button', { name: 'Añadir' }))
  }

  it('tras crear refresca proveedores y navega al listado', async () => {
    await addDune()
    await waitFor(() => expect(mockedRefresh).toHaveBeenCalledWith('9'))
    expect(await screen.findByText('Listado')).toBeInTheDocument()
  })

  it('si el refresco falla, el alta sigue y navega igual', async () => {
    mockedRefresh.mockRejectedValue(new Error('TMDB caído'))
    await addDune()
    expect(await screen.findByText('Listado')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})
