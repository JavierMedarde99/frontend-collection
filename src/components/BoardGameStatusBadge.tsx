import { BOARD_GAME_STATUS_LABELS, BOARD_GAME_STATUS_COLORS, BOARD_GAME_DOT_COLORS } from '../constants/boardGames'
import { BoardGameStatus } from '../types'

interface BoardGameStatusBadgeProps {
  status: BoardGameStatus
}

export default function BoardGameStatusBadge({ status }: BoardGameStatusBadgeProps) {
  const color = BOARD_GAME_STATUS_COLORS[status] || BOARD_GAME_STATUS_COLORS[BoardGameStatus.WISHLIST]
  const label = BOARD_GAME_STATUS_LABELS[status] || status
  const dot = BOARD_GAME_DOT_COLORS[status] || BOARD_GAME_DOT_COLORS[BoardGameStatus.WISHLIST]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption ${color}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
