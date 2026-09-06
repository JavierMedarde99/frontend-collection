import { GAME_STATE_LABELS, GAME_STATE_COLORS, GAME_DOT_COLORS } from '../constants/games'
import { GameStatus } from '../types'

interface GameStatusBadgeProps {
  status: GameStatus
}

export default function GameStatusBadge({ status }: GameStatusBadgeProps) {
  const color = GAME_STATE_COLORS[status] || GAME_STATE_COLORS[GameStatus.WISHLIST]
  const label = GAME_STATE_LABELS[status] || status
  const dot = GAME_DOT_COLORS[status] || GAME_DOT_COLORS[GameStatus.WISHLIST]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption ${color}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
