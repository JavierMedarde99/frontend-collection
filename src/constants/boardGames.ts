import { BoardGameStatus } from '../types'

export const BOARD_GAME_STATES: Record<BoardGameStatus, string> = {
  [BoardGameStatus.OWNED]: 'En propiedad',
  [BoardGameStatus.WISHLIST]: 'Lista de deseos',
  [BoardGameStatus.PREVIOUSLY_OWNED]: 'Lo tuve',
  [BoardGameStatus.FOR_TRADE]: 'Para intercambiar',
}

export const BOARD_GAME_STATUS_LABELS: Record<BoardGameStatus, string> = BOARD_GAME_STATES

export const BOARD_GAME_STATUS_COLORS: Record<BoardGameStatus, string> = {
  [BoardGameStatus.OWNED]: 'bg-green-600 text-white',
  [BoardGameStatus.WISHLIST]: 'bg-yellow-100 text-yellow-800',
  [BoardGameStatus.PREVIOUSLY_OWNED]: 'bg-slate-100 text-slate-700',
  [BoardGameStatus.FOR_TRADE]: 'bg-orange-100 text-orange-800',
}

export const BOARD_GAME_DOT_COLORS: Record<BoardGameStatus, string> = {
  [BoardGameStatus.OWNED]: 'bg-white',
  [BoardGameStatus.WISHLIST]: 'bg-yellow-500',
  [BoardGameStatus.PREVIOUSLY_OWNED]: 'bg-slate-500',
  [BoardGameStatus.FOR_TRADE]: 'bg-orange-500',
}

export const BOARD_GAME_STATUS_OPTIONS: { value: BoardGameStatus; label: string }[] =
  (Object.entries(BOARD_GAME_STATUS_LABELS) as [BoardGameStatus, string][]).map(
    ([value, label]) => ({ value, label }),
  )
