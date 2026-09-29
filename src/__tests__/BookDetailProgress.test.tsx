import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BookDetailPage from '../pages/BookDetailPage'
import { deleteBook, getBook, updateBook, updateReadingProgress } from '../api/booksApi'
import { BookState } from '../types/BookState'
import { BookType } from '../types/BookType'
import type { Book } from '../types/Book'

vi.mock('../api/booksApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/booksApi')>()),
  getBook: vi.fn(),
  updateBook: vi.fn(),
  updateReadingProgress: vi.fn(),
  deleteBook: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { username: 'javi' } }),
}))

const mockedGet = vi.mocked(getBook)
const mockedUpdate = vi.mocked(updateBook)
const mockedProgress = vi.mocked(updateReadingProgress)

const readingBook: Book = {
  id: '1',
  title: 'Dune',
  author: 'Frank Herbert',
  pages: 412,
  pagesRead: 100,
  type: BookType.NOVEL,
  state: BookState.READING,
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/coleccion/1']}>
      <Routes>
        <Route path="/coleccion/:id" element={<BookDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BookDetailPage progreso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGet.mockResolvedValue(readingBook)
    void deleteBook
  })

  it('muestra la barra clicable en READING', async () => {
    renderDetail()
    expect(await screen.findByText('100 / 412 páginas — 24% completado (312 restantes)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actualizar páginas leídas' })).toBeInTheDocument()
  })

  it('editar en el modal guarda vía PATCH y refresca', async () => {
    const user = userEvent.setup()
    mockedProgress.mockResolvedValue({ ...readingBook, pagesRead: 150 })
    renderDetail()
    await user.click(await screen.findByRole('button', { name: 'Actualizar páginas leídas' }))
    const input = screen.getByLabelText('Nº de páginas leídas')
    await user.clear(input)
    await user.type(input, '150')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(mockedProgress).toHaveBeenCalledWith('1', 150))
    expect(await screen.findByText(/150 \/ 412 páginas/)).toBeInTheDocument()
  })

  it('error de API muestra banner sin romper', async () => {
    const user = userEvent.setup()
    mockedProgress.mockRejectedValue(new Error('Fallo de red'))
    renderDetail()
    await user.click(await screen.findByRole('button', { name: 'Actualizar páginas leídas' }))
    const input = screen.getByLabelText('Nº de páginas leídas')
    await user.clear(input)
    await user.type(input, '150')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Fallo de red')
  })

  it('al llegar al total guarda valoración y pasa a completado', async () => {
    const user = userEvent.setup()
    mockedUpdate.mockResolvedValue({ ...readingBook, state: BookState.COMPLETED, pagesRead: 412 })
    renderDetail()
    await user.click(await screen.findByRole('button', { name: 'Actualizar páginas leídas' }))
    const input = screen.getByLabelText('Nº de páginas leídas')
    await user.clear(input)
    await user.type(input, '412')
    await user.click(screen.getByRole('radio', { name: '5 estrellas' }))
    await user.type(screen.getByLabelText('Comentario'), 'Obra maestra')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ state: BookState.COMPLETED, pagesRead: 412, start: 5, comment: 'Obra maestra' }),
    ))
    expect(mockedProgress).not.toHaveBeenCalled()
    expect(screen.queryByText('Finalizado')).not.toBeInTheDocument()
  })

  it('un libro por leer muestra el botón Empezar a leer', async () => {
    mockedGet.mockResolvedValue({ ...readingBook, state: BookState.TO_READ, pagesRead: undefined })
    renderDetail()
    expect(await screen.findByRole('button', { name: 'Empezar a leer' })).toBeInTheDocument()
  })

  it('Empezar a leer guarda páginas y pasa a leyendo', async () => {
    const user = userEvent.setup()
    mockedGet.mockResolvedValue({ ...readingBook, state: BookState.TO_READ, pagesRead: undefined })
    mockedUpdate.mockResolvedValue({ ...readingBook, state: BookState.READING, pagesRead: 40 })
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Empezar a leer' }))
    const input = screen.getByLabelText('Nº de páginas leídas')
    await user.clear(input)
    await user.type(input, '40')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ state: BookState.READING, pagesRead: 40 }),
    ))
    expect(mockedProgress).not.toHaveBeenCalled()
    expect(await screen.findByText(/40 \/ 412 páginas/)).toBeInTheDocument()
  })

  it('un libro ya leyendo no muestra el botón Empezar a leer', async () => {
    renderDetail()
    await screen.findByText(/100 \/ 412 páginas/)
    expect(screen.queryByRole('button', { name: 'Empezar a leer' })).not.toBeInTheDocument()
  })

  it('un libro en lista de deseos muestra el botón En posesión y no el de Empezar', async () => {
    mockedGet.mockResolvedValue({ ...readingBook, state: BookState.WISHLIST, pagesRead: undefined })
    renderDetail()
    expect(await screen.findByRole('button', { name: 'Ya está en mi posesión' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Empezar a leer' })).not.toBeInTheDocument()
  })

  it('En posesión guarda la fecha y mueve el libro a Por leer', async () => {
    const user = userEvent.setup()
    mockedGet.mockResolvedValue({ ...readingBook, state: BookState.WISHLIST, pagesRead: undefined })
    mockedUpdate.mockResolvedValue({
      ...readingBook,
      state: BookState.TO_READ,
      pagesRead: undefined,
      acquisitionDate: '2025-06-01',
    })
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Ya está en mi posesión' }))
    const input = screen.getByLabelText(/Fecha de obtención/)
    await user.clear(input)
    await user.type(input, '2025-06-01')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ state: BookState.TO_READ, acquisitionDate: '2025-06-01' }),
    ))
    expect(mockedProgress).not.toHaveBeenCalled()
    expect(await screen.findByRole('button', { name: 'Empezar a leer' })).toBeInTheDocument()
  })

  it('muestra editorial, año, ISBN y datos de adquisición en los detalles', async () => {
    mockedGet.mockResolvedValue({
      ...readingBook,
      publisher: 'Alfaguara',
      publicationYear: 1965,
      isbn: '9788437604947',
      acquisitionDate: '2024-03-15',
      acquisitionPrice: 12.5,
    })
    renderDetail()

    expect(await screen.findByText('Editorial')).toBeInTheDocument()
    expect(screen.getByText('Alfaguara')).toBeInTheDocument()
    expect(screen.getByText('Año')).toBeInTheDocument()
    expect(screen.getByText('1965')).toBeInTheDocument()
    expect(screen.getByText('9788437604947')).toBeInTheDocument()
    expect(screen.getByText('Fecha de obtención')).toBeInTheDocument()
    expect(screen.getByText('2024-03-15')).toBeInTheDocument()
    expect(screen.getByText('Precio de adquisición')).toBeInTheDocument()
    expect(screen.getByText('12.5 €')).toBeInTheDocument()
  })
})
