import { BookState } from '../types'
import { useReadingProgress } from '../hooks/useReadingProgress'

export interface ReadingProgressBarProps {
  pages: number | undefined
  pagesRead: number | undefined
  state: BookState
  showInput?: boolean
  onChange?: (pagesRead: number) => void
  className?: string
  compact?: boolean
}

/** Barra visual del progreso de lectura. Solo visible para libros en READING. */
export default function ReadingProgressBar({
  pages,
  pagesRead,
  state,
  showInput = false,
  onChange,
  className = '',
  compact = false,
}: ReadingProgressBarProps) {
  const { percent, pagesLeft, isVisible, read, total } = useReadingProgress(pages, pagesRead, state)

  if (!isVisible) {
    if (state === BookState.COMPLETED) {
      return <p className={`text-caption text-slate ${className}`}>Finalizado</p>
    }
    return null
  }

  if (!total) {
    return <p className={`text-caption text-slate ${className}`}>Sin información de páginas</p>
  }

  const finished = read >= total
  const overRead = read > total
  const width = Math.min(100, percent)
  const barHeight = compact ? 'h-1.5' : 'h-2.5'
  const barColor = finished ? 'bg-green-600' : 'bg-action-blue'

  const editable = showInput && state === BookState.READING && onChange !== undefined
  const exceeds = editable && read > total

  return (
    <div className={className}>
      <div className={`w-full bg-silver rounded-full ${barHeight}`}>
        <div
          role="progressbar"
          aria-valuenow={width}
          aria-valuemin={0}
          aria-valuemax={100}
          className={`${barColor} ${barHeight} rounded-full transition-all duration-300`}
          style={{ width: `${width}%` }}
        />
      </div>
      {!compact && (
        <p className="text-caption text-slate mt-1">
          {read === 0 && 'No comenzado'}
          {read > 0 && !finished && `${read} / ${total} páginas — ${percent}% completado (${pagesLeft} restantes)`}
          {finished && !overRead && 'Completado'}
          {overRead && `Completado (valor desactualizado: ${read} / ${total})`}
        </p>
      )}
      {compact && <span className="text-caption text-slate">{width}%</span>}
      {editable && (
        <div className="mt-2">
          <input
            aria-label="Páginas leídas"
            className="input"
            type="number"
            min="0"
            max={total}
            value={read}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          {exceeds && (
            <p className="text-caption text-red-600 mt-1">No puede exceder el total de páginas</p>
          )}
        </div>
      )}
    </div>
  )
}
