import { MOVIE_SHOW_STATE_LABELS, MOVIE_SHOW_STATE_COLORS, MOVIE_SHOW_DOT_COLORS } from '../constants/movieshows'
import { MovieShowStatus } from '../types'

interface MovieShowStatusBadgeProps {
  status: MovieShowStatus
}

export default function MovieShowStatusBadge({ status }: MovieShowStatusBadgeProps) {
  const color = MOVIE_SHOW_STATE_COLORS[status] || MOVIE_SHOW_STATE_COLORS[MovieShowStatus.PLAN_TO_WATCH]
  const label = MOVIE_SHOW_STATE_LABELS[status] || status
  const dot = MOVIE_SHOW_DOT_COLORS[status] || MOVIE_SHOW_DOT_COLORS[MovieShowStatus.PLAN_TO_WATCH]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption ${color}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
