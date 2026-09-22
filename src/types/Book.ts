import { BookType } from './BookType'
import { BookState } from './BookState'
import type { UserOwned } from './Api'

export interface Book {
  id: string
  externalId?: string
  title: string
  author: string
  descripcion?: string
  pages?: number
  pagesRead?: number
  type: BookType
  state: BookState
  comment?: string
  start?: number
  startDate?: string
  endDate?: string
  frontpage?: string
  userOwned?: UserOwned | null
}
