import type { PageBookResponse, ListBooksParams, Book, BookFormData, PageBookSearchResult } from '../types'
import { throwRequestError } from './errors'
import { authFetch } from './authFetch'
import { apiUrl } from './apiBase'

const BASE_URL = '/api/v1/books'

async function request<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const res = await authFetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    await throwRequestError(res)
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json() as Promise<T>
  return null
}

export function listBooks(params: ListBooksParams = {}): Promise<PageBookResponse> {
  const search = new URLSearchParams()
  const { page, size, sort, state, name, author, type , genre, owner, viewerId } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (state) search.set('state', state)
  if (name) search.set('name', name)
  if (author) search.set('author', author)
  if (type) search.set('type', type)
  if (genre) search.set('genre', genre)
  if (owner) search.set('owner', owner)
  if (viewerId) search.set('viewerId', viewerId)
  const qs = search.toString()
  return request<PageBookResponse>(`${apiUrl(BASE_URL)}${qs ? `?${qs}` : ''}`) as Promise<PageBookResponse>
}

export function getBook(id: string): Promise<Book> {
  return request<Book>(`${apiUrl(BASE_URL)}/${id}`) as Promise<Book>
}

export function createBook(book: BookFormData): Promise<Book> {
  return request<Book>(apiUrl(BASE_URL), {
    method: 'POST',
    body: JSON.stringify(book),
  }) as Promise<Book>
}

export function updateBook(id: string, book: BookFormData): Promise<Book> {
  return request<Book>(`${apiUrl(BASE_URL)}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  }) as Promise<Book>
}

export function deleteBook(id: string): Promise<null> {
  return request<null>(`${apiUrl(BASE_URL)}/${id}`, { method: 'DELETE' })
}

// Catálogo de géneros en uso en la colección (para autocompletar el selector).
export function listBookGenres(): Promise<string[]> {
  return request<string[]>(`${apiUrl(BASE_URL)}/genres`) as Promise<string[]>
}

// Construye el payload de crear/editar a partir de un libro de la API.
export function bookToFormData(book: Book): BookFormData {
  return {
    title: book.title,
    author: book.author,
    type: book.type,
    state: book.state,
    descripcion: book.descripcion,
    pages: book.pages,
    pagesRead: book.pagesRead,
    comment: book.comment,
    start: book.start,
    startDate: book.startDate,
    endDate: book.endDate,
    frontpage: book.frontpage,
    externalId: book.externalId,
  }
}

export function searchBooksPage(name: string, page = 0, size = 10): Promise<PageBookSearchResult> {
  const qs = new URLSearchParams({ name, page: String(page), size: String(size) })
  return request<PageBookSearchResult>(`${apiUrl(BASE_URL)}/search?${qs}`) as Promise<PageBookSearchResult>
}

export function searchBooksByIsbn(isbn: string, page = 0, size = 10): Promise<PageBookSearchResult> {
  const qs = new URLSearchParams({ isbn, page: String(page), size: String(size) })
  return request<PageBookSearchResult>(`${apiUrl(BASE_URL)}/search?${qs}`) as Promise<PageBookSearchResult>
}

// Actualiza solo las páginas leídas sin tocar el resto del libro.
export function updateReadingProgress(id: string, pagesRead: number): Promise<Book> {
  return request<Book>(`${apiUrl(BASE_URL)}/${id}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ pagesRead }),
  }) as Promise<Book>
}
