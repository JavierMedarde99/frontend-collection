import { FIGURE_STATUS_LABELS, FIGURE_STATUS_COLORS, FIGURE_DOT_COLORS } from '../constants/figures'
import type { FunkoStatus } from '../types/Funko'
import type { AmiiboStatus } from '../types/Amiibo'

interface FigureStatusBadgeProps {
  status: FunkoStatus | AmiiboStatus
}

export default function FigureStatusBadge({ status }: FigureStatusBadgeProps) {
  const color = FIGURE_STATUS_COLORS[status] || FIGURE_STATUS_COLORS.WISHLIST
  const label = FIGURE_STATUS_LABELS[status] || status
  const dot = FIGURE_DOT_COLORS[status] || FIGURE_DOT_COLORS.WISHLIST
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption ${color}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
