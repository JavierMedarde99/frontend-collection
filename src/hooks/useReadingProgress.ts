import { BookState } from '../types'

/** Cálculo derivado del progreso de lectura: porcentaje, restantes y visibilidad. */
export function useReadingProgress(pages?: number, pagesRead?: number, state?: BookState) {
  const total = pages ?? 0
  const read = pagesRead ?? 0

  const percent = total > 0 ? Math.round((read / total) * 100) : 0
  const pagesLeft = total > 0 ? Math.max(0, total - read) : 0
  const isVisible = state === BookState.READING && total > 0

  return { percent, pagesLeft, isVisible, read, total }
}
