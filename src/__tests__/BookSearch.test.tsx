import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BookSearch from '../components/BookSearch'
import { BookState } from '../types/BookState'
import { BookType } from '../types/BookType'
import type { SearchBookResult } from '../types/Api'

const results: SearchBookResult[] = [
  {
    id: 'book-1',
    title: 'Dune',
    authors: ['Frank Herbert'],
    description: 'Novela de ciencia ficción.',
  },
]

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('../api/booksApi', () => ({
  searchBooks: vi.fn(),
  createBook: vi.fn(),
}))

import { searchBooks, createBook } from '../api/booksApi'

const mockedSearch = vi.mocked(searchBooks)
const mockedCreate = vi.mocked(createBook)

describe('BookSearch', () => {
  it('busca libros y muestra los resultados', async () => {
    mockedSearch.mockResolvedValue(results)
    render(<BookSearch />)

    const input = screen.getByRole('textbox', { name: 'Búsqueda' })
    await userEvent.type(input, 'dune')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument()
    expect(mockedSearch).toHaveBeenCalledWith('dune')
  })

  it('muestra el estado vacío cuando no hay resultados', async () => {
    mockedSearch.mockResolvedValue([])
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
    mockedSearch.mockResolvedValue(results)
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
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    await waitFor(() => expect(mockedCreate).toHaveBeenCalledTimes(1))
    expect(captured).toMatchObject({
      title: 'Dune',
      author: 'Frank Herbert',
      type: BookType.MANGA,
      state: BookState.COMPLETED,
    })
  })

  it('mantiene el modal abierto si falla al añadir', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    mockedSearch.mockResolvedValue(results)
    mockedCreate.mockRejectedValue(new Error('No se pudo añadir el libro.'))

    render(<BookSearch />)

    const input = screen.getByRole('textbox', { name: 'Búsqueda' })
    await userEvent.type(input, 'dune')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Añadir a mi colección' }))
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('button', { name: 'Añadir' })).toBeInTheDocument()
  })
})