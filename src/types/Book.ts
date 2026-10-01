import { BookType } from './BookType'
import { BookState } from './BookState'
import type { UserOwned } from './Api'

export interface Book {
  id: string
  externalId?: string
  isbn?: string
  title: string
  author: string
  descripcion?: string
  pages?: number
  pagesRead?: number
  genres?: string[]
  type: BookType
  state: BookState
  comment?: string
  start?: number
  startDate?: string
  endDate?: string
  frontpage?: string
  publisher?: string
  publicationYear?: number
  /** Fecha de obtención del libro. No se rellena en WISHLIST. */
  acquisitionDate?: string
  acquisitionPrice?: number
  userOwned?: UserOwned | null
}
