import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BookListPage from '../pages/BookListPage'
import { deleteBook, listBookGenres, listBooks } from '../api/booksApi'
import { BookState } from '../types/BookState'
import { BookType } from '../types/BookType'

vi.mock('../api/booksApi', () => ({
  listBooks: vi.fn(),
  listBookGenres: vi.fn().mockResolvedValue([]),
  deleteBook: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 'u1', username: 'javi' } }),
}))

const mockedList = vi.mocked(listBooks)

const dune = {
  id: '1',
  title: 'Dune',
  author: 'Frank Herbert',
  pages: 412,
  type: BookType.NOVEL,
  state: BookState.TO_READ,
  genres: ['Ciencia ficción'],
}

function page(items: unknown[]) {
  return { content: items, totalPages: 1, totalElements: items.length, number: 0, size: 12, empty: items.length === 0 }
}

describe('BookListPage multiselect de género', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    mockedList.mockResolvedValue(page([dune]) as never)
    vi.mocked(listBookGenres).mockResolvedValue(['Fantasía', 'Terror'])
    void deleteBook
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('dos géneros recargan con array genre (OR en el back)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <BookListPage />
      </MemoryRouter>,
    )
    await screen.findByText('Dune')

    await user.click(screen.getByRole('button', { name: /filtros/i }))
    await user.click(await screen.findByRole('button', { name: 'Fantasía' }))
    await user.click(screen.getByRole('button', { name: 'Terror' }))

    await waitFor(() =>
      expect(mockedList).toHaveBeenCalledWith(expect.objectContaining({ genre: ['Fantasía', 'Terror'] })),
    )
  })
})
