import { STATE_LABELS, STATE_COLORS } from '../constants/books'
import { BookState } from '../types'

const DOT_COLORS: Record<BookState, string> = {
  [BookState.TO_READ]: 'bg-accent',
  [BookState.READING]: 'bg-indigo-500',
  [BookState.COMPLETED]: 'bg-emerald-500',
}

interface StatusBadgeProps {
  state: BookState
}

export default function StatusBadge({ state }: StatusBadgeProps) {
  const color = STATE_COLORS[state] || STATE_COLORS[BookState.TO_READ]
  const label = STATE_LABELS[state] || state
  const dot = DOT_COLORS[state] || DOT_COLORS[BookState.TO_READ]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption ${color}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
