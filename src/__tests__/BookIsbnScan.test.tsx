import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BookIsbnScan from '../components/BookIsbnScan'

const scanStore = vi.hoisted(() => ({ onSuccess: null as ((d: string) => void) | null }))

vi.mock('html5-qrcode', () => {
  class MockHtml5Qrcode {
    start = vi.fn((_c: unknown, _o: unknown, ok: (d: string) => void) => {
      scanStore.onSuccess = ok
      return Promise.resolve()
    })
    stop = vi.fn(() => Promise.resolve())
    clear = vi.fn(() => Promise.resolve())
  }
  return { Html5Qrcode: MockHtml5Qrcode }
})

vi.mock('../api/booksApi', () => ({
  searchBooksByIsbn: vi.fn(),
  createBook: vi.fn(),
}))

import { searchBooksByIsbn, createBook } from '../api/booksApi'

const mockedIsbnSearch = vi.mocked(searchBooksByIsbn)
const mockedCreate = vi.mocked(createBook)

const duneResult = {
  id: 'g1',
  title: 'Dune',
  authors: ['Frank Herbert'],
  pageCount: 412,
  coverImage: 'http://img/dune.jpg',
  description: 'Ciencia ficción.',
  publisher: 'Acervo',
}

function renderScan() {
  return render(
    <MemoryRouter>
      <BookIsbnScan />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  scanStore.onSuccess = null
  vi.clearAllMocks()
})

describe('BookIsbnScan', () => {
  it('abre el modal de cámara al pulsar Escanear código', async () => {
    renderScan()
    await userEvent.click(screen.getByRole('button', { name: /Escanear código/ }))
    expect(screen.getByRole('dialog', { name: 'Escanear ISBN' })).toBeInTheDocument()
  })

  it('busca por ISBN manual y muestra resultados', async () => {
    mockedIsbnSearch.mockResolvedValue({ content: [duneResult], totalPages: 1 } as never)
    renderScan()
    await userEvent.type(screen.getByLabelText('ISBN'), '9788498382671')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(mockedIsbnSearch).toHaveBeenCalledWith('9788498382671', 0, 5)
    expect(await screen.findByText('Dune')).toBeInTheDocument()
  })

  it('el escaneo rellena y busca automáticamente', async () => {
    mockedIsbnSearch.mockResolvedValue({ content: [], totalPages: 0 } as never)
    renderScan()
    await userEvent.click(screen.getByRole('button', { name: /Escanear código/ }))
    await waitFor(() => expect(scanStore.onSuccess).not.toBeNull())

    scanStore.onSuccess!('9788498382671')

    await waitFor(() => expect(mockedIsbnSearch).toHaveBeenCalledWith('9788498382671', 0, 5))
    expect(screen.queryByRole('dialog', { name: 'Escanear ISBN' })).not.toBeInTheDocument()
  })

  it('añade el libro con el isbn en el payload', async () => {
    mockedIsbnSearch.mockResolvedValue({ content: [duneResult], totalPages: 1 } as never)
    mockedCreate.mockResolvedValue({} as never)
    renderScan()
    await userEvent.type(screen.getByLabelText('ISBN'), '9788498382671')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    await waitFor(() => expect(mockedCreate).toHaveBeenCalledTimes(1))
    expect(mockedCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9788498382671',
    }))
  })
})
