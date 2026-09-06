import { BookType, BookState } from '../types'

export const BOOK_TYPES: Record<BookType, string> = {
  [BookType.MANGA]: 'Manga',
  [BookType.NOVEL]: 'Novela',
  [BookType.GRAPHIC_NOVEL]: 'Novela gráfica',
}

export const TYPE_LABELS: Record<BookType, string> = {
  [BookType.MANGA]: 'Manga',
  [BookType.NOVEL]: 'Novela',
  [BookType.GRAPHIC_NOVEL]: 'Novela gráfica',
}

export const TYPE_BADGE_COLORS: Record<BookType, string> = {
  [BookType.MANGA]: 'bg-rose-100 text-rose-700',
  [BookType.NOVEL]: 'bg-indigo-100 text-indigo-700',
  [BookType.GRAPHIC_NOVEL]: 'bg-emerald-100 text-emerald-700',
}

export const BOOK_STATES: Record<BookState, string> = {
  [BookState.TO_READ]: 'Por leer',
  [BookState.READING]: 'Leyendo',
  [BookState.COMPLETED]: 'Completado',
}

export const STATE_LABELS: Record<BookState, string> = {
  [BookState.TO_READ]: 'Por leer',
  [BookState.READING]: 'Leyendo',
  [BookState.COMPLETED]: 'Completado',
}

export const STATE_COLORS: Record<BookState, string> = {
  [BookState.TO_READ]: 'bg-accent-soft text-accent-deep',
  [BookState.READING]: 'bg-indigo-100 text-indigo-700',
  [BookState.COMPLETED]: 'bg-emerald-100 text-emerald-700',
}
