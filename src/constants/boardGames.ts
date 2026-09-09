import { BoardGameStatus } from '../types'

export const BOARD_GAME_STATES: Record<BoardGameStatus, string> = {
  [BoardGameStatus.OWNED]: 'En propiedad',
  [BoardGameStatus.WISHLIST]: 'Lista de deseos',
}

export const BOARD_GAME_STATUS_LABELS: Record<BoardGameStatus, string> = BOARD_GAME_STATES

export const BOARD_GAME_STATUS_COLORS: Record<BoardGameStatus, string> = {
  [BoardGameStatus.OWNED]: 'bg-green-600 text-white',
  [BoardGameStatus.WISHLIST]: 'bg-yellow-100 text-yellow-800',
}

export const BOARD_GAME_DOT_COLORS: Record<BoardGameStatus, string> = {
  [BoardGameStatus.OWNED]: 'bg-white',
  [BoardGameStatus.WISHLIST]: 'bg-yellow-500',
}

export const BOARD_GAME_STATUS_OPTIONS: { value: BoardGameStatus; label: string }[] =
  (Object.entries(BOARD_GAME_STATUS_LABELS) as [BoardGameStatus, string][]).map(
    ([value, label]) => ({ value, label }),
  )

/** Convierte un rating BGG (0–10) a escala de 5 estrellas, redondeado a 1 decimal. */
export function bggRatingToStars(rating: number): number {
  return Math.round((rating / 2) * 10) / 10
}
