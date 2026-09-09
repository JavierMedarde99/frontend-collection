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
