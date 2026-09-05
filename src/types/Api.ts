// src/types/Api.ts
import { Book } from './Book'
import { BookState } from './BookState'
import { BookType } from './BookType'

export interface PageBookResponse {
  content: Book[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface ListBooksParams {
  page?: number
  size?: number
  sort?: string
  state?: BookState | ''
  type?: BookType | ''
  name?: string
  author?: string
}

export interface BookFormData {
  title: string
  author: string
  type: BookType
  state: BookState
  descripcion?: string
  pages?: number | ''
  comment?: string
  start?: number
  startDate?: string
  endDate?: string
  frontpage?: string
  externalId?: string
}

export interface SearchBookResult {
  id: string
  title: string
  authors: string[]
  isbn?: string
  coverImage?: string
  description?: string
  pageCount?: number
  publisher?: string
  publishedDate?: string
  language?: string
  categories?: string[]
}

export interface ApiError extends Error {
  status?: number
}
