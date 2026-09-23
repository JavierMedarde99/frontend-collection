import { useState } from 'react'
import { BookState } from '../types'
import { useReadingProgress } from '../hooks/useReadingProgress'
import StarRating from './StarRating'

export interface ProgressExtras {
  start?: number
  comment?: string
}

export interface ReadingProgressBarProps {
  pages: number | undefined
  pagesRead: number | undefined
  state: BookState
  showInput?: boolean
  onChange?: (pagesRead: number, extras?: ProgressExtras) => void
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
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [finishStart, setFinishStart] = useState(0)
  const [finishComment, setFinishComment] = useState('')

  if (state === BookState.READING && !total) {
    return <p className={`text-caption text-slate ${className}`}>Sin información de páginas</p>
  }

  if (!isVisible) {
    if (state === BookState.COMPLETED) {
      return <p className={`text-caption text-slate ${className}`}>Finalizado</p>
    }
    return null
  }

  const finished = read >= total
  const overRead = read > total
  const width = Math.min(100, percent)
  const barHeight = compact ? 'h-1.5' : 'h-2.5'
  const barColor = finished ? 'bg-green-600' : 'bg-action-blue'

  const editable = showInput && state === BookState.READING && onChange !== undefined
  const draftValue = draft === '' ? NaN : Number(draft)
  const draftExceeds = draft !== '' && draftValue > total
  const draftFinishes = draft !== '' && total > 0 && draftValue === total

  function openModal() {
    setDraft(String(read))
    setFinishStart(0)
    setFinishComment('')
    setModalOpen(true)
  }

  function handleSave() {
    if (draft === '' || Number.isNaN(draftValue) || draftExceeds || !onChange) return
    setModalOpen(false)
    onChange(draftValue, draftFinishes ? { start: finishStart || undefined, comment: finishComment.trim() || undefined } : undefined)
  }

  const bar = (
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
  )

  return (
    <div className={className}>
      {editable ? (
        <button
          type="button"
          className="block w-full text-left cursor-pointer"
          onClick={openModal}
          aria-label="Actualizar páginas leídas"
        >
          {bar}
        </button>
      ) : (
        bar
      )}
      {!compact && (
        <p className="text-caption text-slate mt-1">
          {read === 0 && 'No comenzado'}
          {read > 0 && !finished && `${read} / ${total} páginas — ${percent}% completado (${pagesLeft} restantes)`}
          {finished && !overRead && 'Completado'}
          {overRead && `Completado (valor desactualizado: ${read} / ${total})`}
        </p>
      )}
      {compact && <span className="text-caption text-slate">{width}%</span>}
      {editable && modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Actualizar páginas leídas"
            className="modal w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-heading-sm mb-1">Páginas leídas</h3>
            <p className="text-body text-graphite mb-5">De {total} páginas en total</p>
            <label className="label" htmlFor="reading-progress-input">
              Nº de páginas leídas
            </label>
            <input
              id="reading-progress-input"
              className="input"
              type="number"
              min="0"
              max={total}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            {draftExceeds && (
              <p className="text-caption text-red-600 mt-1">No puede exceder el total de páginas</p>
            )}
            {draftFinishes && (
              <div className="mt-4 border-t border-silver/60 pt-4">
                <p className="text-body font-medium mb-2">¡Última página! Valora el libro</p>
                <StarRating value={finishStart} onChange={setFinishStart} />
                <label className="label mt-4" htmlFor="reading-finish-comment">
                  Comentario
                </label>
                <textarea
                  id="reading-finish-comment"
                  className="input !h-auto !min-h-[80px] !py-3"
                  value={finishComment}
                  onChange={(e) => setFinishComment(e.target.value)}
                  placeholder="Notas personales…"
                />
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
              <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={draft === '' || draftExceeds}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
