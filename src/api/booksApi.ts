import type { PageBookResponse, ListBooksParams, Book, BookFormData, PageBookSearchResult } from '../types'
import { throwRequestError } from './errors'
import { authFetch } from './authFetch'

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
  const { page, size, sort, state, name, author, type } = params
  if (page !== undefined && page !== null) search.set('page', String(page))
  if (size !== undefined && size !== null) search.set('size', String(size))
  if (sort) search.set('sort', sort)
  if (state) search.set('state', state)
  if (name) search.set('name', name)
  if (author) search.set('author', author)
  if (type) search.set('type', type)
  const qs = search.toString()
  return request<PageBookResponse>(`${BASE_URL}${qs ? `?${qs}` : ''}`) as Promise<PageBookResponse>
}

export function getBook(id: string): Promise<Book> {
  return request<Book>(`${BASE_URL}/${id}`) as Promise<Book>
}

export function createBook(book: BookFormData): Promise<Book> {
  return request<Book>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(book),
  }) as Promise<Book>
}

export function updateBook(id: string, book: BookFormData): Promise<Book> {
  return request<Book>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  }) as Promise<Book>
}

export function deleteBook(id: string): Promise<null> {
  return request<null>(`${BASE_URL}/${id}`, { method: 'DELETE' })
}

export function searchBooksPage(name: string, page = 0, size = 10): Promise<PageBookSearchResult> {
  const qs = new URLSearchParams({ name, page: String(page), size: String(size) })
  return request<PageBookSearchResult>(`${BASE_URL}/search?${qs}`) as Promise<PageBookSearchResult>
}
