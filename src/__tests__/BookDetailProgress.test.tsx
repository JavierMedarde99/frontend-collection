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
    expect(await screen.findByText('Finalizado')).toBeInTheDocument()
  })
})
