import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BookDetailPage from '../pages/BookDetailPage'
import { getBook } from '../api/booksApi'
import { BookState } from '../types/BookState'
import { BookType } from '../types/BookType'
import type { Book } from '../types/Book'

vi.mock('../api/booksApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/booksApi')>()),
  getBook: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { username: 'javi' } }),
}))

const mockedGet = vi.mocked(getBook)

function bookWithPrice(state: BookState): Book {
  return {
    id: '1',
    title: 'Dune',
    author: 'Frank Herbert',
    pages: 412,
    type: BookType.NOVEL,
    state,
    acquisitionPrice: 12.5,
  }
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

describe('BookDetailPage precio en lista de deseos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('oculta el precio si el libro está en WISHLIST', async () => {
    mockedGet.mockResolvedValue(bookWithPrice(BookState.WISHLIST))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.queryByText('Precio de adquisición')).not.toBeInTheDocument()
    expect(screen.queryByText('12.5 €')).not.toBeInTheDocument()
  })

  it('muestra el precio si el libro está en otro estado', async () => {
    mockedGet.mockResolvedValue(bookWithPrice(BookState.TO_READ))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByText('Precio de adquisición')).toBeInTheDocument()
    expect(screen.getByText('12.5 €')).toBeInTheDocument()
  })
})