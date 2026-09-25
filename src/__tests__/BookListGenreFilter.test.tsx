import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BookListPage from '../pages/BookListPage'
import { deleteBook, listBooks } from '../api/booksApi'
import { BookState } from '../types/BookState'
import { BookType } from '../types/BookType'

vi.mock('../api/booksApi', () => ({
  listBooks: vi.fn(),
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

describe('BookListPage filtro por género', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
    mockedList.mockResolvedValue(page([dune]) as never)
    void deleteBook
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('al elegir género recarga con ?genre= en el endpoint', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <BookListPage />
      </MemoryRouter>,
    )
    await screen.findByText('Dune')
    expect(mockedList).toHaveBeenCalledWith(expect.objectContaining({ genre: undefined }))

    await user.click(screen.getByRole('button', { name: /filtros/i }))
    await user.selectOptions(screen.getByLabelText('Filtrar por género'), 'Terror')

    await waitFor(() =>
      expect(mockedList).toHaveBeenCalledWith(expect.objectContaining({ genre: 'Terror' })),
    )
  })
})
