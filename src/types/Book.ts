// src/types/Book.ts
import { BookType } from './BookType'
import { BookState } from './BookState'

export interface Book {
  id: string
  externalId?: string
  title: string
  author: string
  descripcion?: string
  pages?: number
  type: BookType
  state: BookState
  comment?: string
  start?: number
  startDate?: string
  endDate?: string
  frontpage?: string
}
