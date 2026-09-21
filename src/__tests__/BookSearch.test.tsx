import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BookSearch from '../components/BookSearch'
import { BookState } from '../types/BookState'
import { BookType } from '../types/BookType'
import type { SearchBookResult } from '../types/Api'
import type { PageBookSearchResult } from '../types/Api'

const results: SearchBookResult[] = [
  {
    id: 'book-1',
    title: 'Dune',
    authors: ['Frank Herbert'],
    description: 'Novela de ciencia ficción.',
  },
]

function bookPage(items: SearchBookResult[]): PageBookSearchResult {
  return { content: items, totalPages: 1, totalElements: items.length, number: 0, size: 10, empty: items.length === 0 }
}

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../api/booksApi', () => ({
  searchBooksPage: vi.fn(),
  createBook: vi.fn(),
}))

import { searchBooksPage, createBook } from '../api/booksApi'

const mockedSearch = vi.mocked(searchBooksPage)
const mockedCreate = vi.mocked(createBook)

let trigger: ((entries: [{ isIntersecting: boolean }]) => void) | null = null

class MockIntersectionObserver {
  constructor(cb: (entries: [{ isIntersecting: boolean }]) => void) {
    trigger = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  trigger = null
  vi.clearAllMocks()
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BookSearch', () => {
  it('busca libros y muestra los resultados', async () => {
    mockedSearch.mockResolvedValue(bookPage(results))
    render(<BookSearch />)

    const input = screen.getByRole('textbox', { name: 'Búsqueda' })
    await userEvent.type(input, 'dune')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument()
    expect(mockedSearch).toHaveBeenCalledWith('dune', 0, 10)
  })

  it('muestra el estado vacío cuando no hay resultados', async () => {
    mockedSearch.mockResolvedValue(bookPage([]))
    render(<BookSearch />)

    const input = screen.getByRole('textbox', { name: 'Búsqueda' })
    await userEvent.type(input, 'zzz')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByText('Sin resultados')).toBeInTheDocument()
  })

  it('muestra el error de búsqueda en la interfaz', async () => {
    mockedSearch.mockRejectedValue(new Error('Error de red'))
    render(<BookSearch />)

    const input = screen.getByRole('textbox', { name: 'Búsqueda' })
    await userEvent.type(input, 'dune')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Error de red')
  })

  it('añade un libro desde el modal y resetea el formulario', async () => {
    mockedSearch.mockResolvedValue(bookPage(results))
    let captured: unknown
    mockedCreate.mockImplementation(async (payload) => {
      captured = payload
      return undefined as never
    })
    render(<BookSearch />)

    const input = screen.getByRole('textbox', { name: 'Búsqueda' })
    await userEvent.type(input, 'dune')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByDisplayValue('Novela'), BookType.MANGA)
    await userEvent.selectOptions(screen.getByDisplayValue('Por leer'), BookState.COMPLETED)
    await userEvent.type(screen.getByPlaceholderText('Ej. 320'), '412')
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    await waitFor(() => expect(mockedCreate).toHaveBeenCalledTimes(1))
    expect(captured).toMatchObject({
      title: 'Dune',
      author: 'Frank Herbert',
      type: BookType.MANGA,
      state: BookState.COMPLETED,
      pages: 412,
    })
  })

  it('pide las páginas si el resultado trae 0', async () => {
    mockedSearch.mockResolvedValue(bookPage(results))
    render(<BookSearch />)

    const input = screen.getByRole('textbox', { name: 'Búsqueda' })
    await userEvent.type(input, 'dune')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))
    expect(screen.getByPlaceholderText('Ej. 320')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('nº de páginas es obligatorio')
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('mantiene el modal abierto si falla al añadir', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    mockedSearch.mockResolvedValue(bookPage(results))
    mockedCreate.mockRejectedValue(new Error('No se pudo añadir el libro.'))

    render(<BookSearch />)

    const input = screen.getByRole('textbox', { name: 'Búsqueda' })
    await userEvent.type(input, 'dune')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))
    await userEvent.type(screen.getByPlaceholderText('Ej. 320'), '412')
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('button', { name: 'Añadir' })).toBeInTheDocument()
  })
})
