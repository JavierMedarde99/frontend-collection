import { STATE_LABELS, STATE_COLORS } from '../constants/books'

const DOT_COLORS = {
  TO_READ: 'bg-accent',
  READING: 'bg-indigo-500',
  COMPLETED: 'bg-emerald-500',
}

export default function StatusBadge({ state }) {
  const color = STATE_COLORS[state] || STATE_COLORS.TO_READ
  const label = STATE_LABELS[state] || state
  const dot = DOT_COLORS[state] || DOT_COLORS.TO_READ
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption ${color}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
