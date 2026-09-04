import { STATE_LABELS, STATE_COLORS } from '../constants/books'

export default function StatusBadge({ state }) {
  const color = STATE_COLORS[state] || STATE_COLORS.TO_READ
  const label = STATE_LABELS[state] || state
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-caption ${color}`}>
      {label}
    </span>
  )
}
