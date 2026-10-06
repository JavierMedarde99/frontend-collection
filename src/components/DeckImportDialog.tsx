import { useEffect, useRef, useState } from 'react'
import { addCardToDeck, getDeckImportJob, importDeckFile, importDeckText } from '../api/deckApi'
import type {
  DeckImportCandidateResponse,
  DeckImportJobResponse,
  DeckImportUnresolvedResponse,
  DeckResponse,
} from '../types'
import { DECK_STATUS_COLORS, DECK_STATUS_LABELS } from '../constants/decks'
import ErrorBanner from './ErrorBanner'
import ManaColorDots from './ManaColorDots'

export interface DeckImportDialogProps {
  open: boolean
  deckId: string
  deckName: string
  onClose: () => void
  onImported: (deck: DeckResponse) => void
}

type ImportStep = { kind: 'source' } | { kind: 'running'; jobId: string } | { kind: 'result' }
type Source = 'text' | 'file'

const PHASE_LABELS: Record<string, string> = {
  PARSING: 'Leyendo lista…',
  RESOLVING: 'Resolviendo cartas…',
  SAVING: 'Guardando mazo…',
  DONE: 'Completando…',
}

/**
 * Importación masiva de cartas a un mazo ya creado: pega una lista
 * (MTGO/JSON/CSV) o sube un archivo, hace poll del job asíncrono del
 * backend y muestra el informe (validación + ambiguas) al terminar.
 */
export default function DeckImportDialog({ open, deckId, deckName, onClose, onImported }: DeckImportDialogProps) {
  const [step, setStep] = useState<ImportStep>({ kind: 'source' })
  const [job, setJob] = useState<DeckImportJobResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<Source>('text')
  const [mode, setMode] = useState<'replace' | 'merge'>('replace')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [hidden, setHidden] = useState<Set<number>>(new Set()) // líneas resueltas o ignoradas
  const [confirmBusy, setConfirmBusy] = useState<string | null>(null) // scryfallId en curso
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const onImportedRef = useRef(onImported)
  useEffect(() => {
    onImportedRef.current = onImported
  }, [onImported])

  useEffect(() => {
    if (step.kind !== 'running') return
    const jobId = step.jobId
    let cancelled = false
    async function tick() {
      try {
        const next = await getDeckImportJob(deckId, jobId)
        if (cancelled) return
        if (next.status === 'COMPLETED') {
          setJob(next)
          setStep({ kind: 'result' })
          if (next.deck) onImportedRef.current(next.deck)
        } else if (next.status === 'FAILED') {
          setJob(next)
          setError(next.error || 'La importación falló.')
          setStep({ kind: 'result' })
        } else {
          setJob(next) // PENDING/RUNNING → progreso
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'No se pudo consultar la importación.')
        setStep({ kind: 'result' })
      }
    }
    const timer = window.setInterval(tick, 2000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [deckId, step])

  async function handleImport() {
    if (sending) return
    const empty = source === 'text' ? !text.trim() : !file
    if (empty) return
    setSending(true)
    setError(null)
    try {
      const accepted =
        source === 'text'
          ? await importDeckText(deckId, text, mode)
          : await importDeckFile(deckId, file!, mode)
      setStep({ kind: 'running', jobId: accepted.jobId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la importación.')
    } finally {
      setSending(false)
    }
  }

  async function handleConfirmCandidate(u: DeckImportUnresolvedResponse, c: DeckImportCandidateResponse) {
    if (confirmBusy) return
    setConfirmBusy(c.scryfallId)
    setConfirmError(null)
    try {
      const updated = await addCardToDeck(deckId, { scryfallId: c.scryfallId, quantity: u.quantity })
      onImported(updated)
      setHidden((prev) => new Set(prev).add(u.line))
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'No se pudo añadir la carta.')
    } finally {
      setConfirmBusy(null)
    }
  }

  function handleDismiss(line: number) {
    setHidden((prev) => new Set(prev).add(line))
  }

  if (!open) return null

  const phaseLabel = job?.phase ? PHASE_LABELS[job.phase] ?? 'Importando…' : 'Importando…'
  const total = job?.progress.total ?? 0
  const processed = job?.progress.processed ?? 0
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0
  const cards = job?.deck?.cards ?? []
  const totalCount = cards.reduce((sum, c) => sum + (c.quantity || 0), 0)
  const unresolved = (job?.unresolved ?? []).filter((u) => !hidden.has(u.line))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Importar mazo"
        className="modal-paper modal w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="font-display text-heading-sm">Importar mazo</h3>
            <p className="text-caption text-graphite">{deckName}</p>
          </div>
          <button
            type="button"
            className="btn-ghost !px-3 !py-1.5"
            onClick={onClose}
            disabled={sending}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {step.kind === 'source' && (
            <>
              <div className="method-tabs">
                <button
                  type="button"
                  className={`method-tab ${source === 'text' ? 'on' : ''}`}
                  onClick={() => setSource('text')}
                >
                  Pegar lista
                </button>
                <button
                  type="button"
                  className={`method-tab ${source === 'file' ? 'on' : ''}`}
                  onClick={() => setSource('file')}
                >
                  Subir archivo
                </button>
              </div>

              {source === 'text' ? (
                <label className="flex flex-col gap-1.5">
                  <span className="label">Lista de cartas (MTGO, JSON o CSV)</span>
                  <textarea
                    className="input min-h-40 font-mono text-body-sm"
                    aria-label="Lista de cartas"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={'1 Sol Ring\n1 Arcane Signet\n1 Atraxa, Praetors\' Voice'}
                  />
                </label>
              ) : (
                <label className="flex flex-col gap-1.5">
                  <span className="label">Archivo .txt, .json o .csv</span>
                  <input
                    type="file"
                    accept=".txt,.json,.csv"
                    aria-label="Archivo de mazo"
                    className="input"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file && <span className="text-caption text-graphite">{file.name}</span>}
                </label>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="flex flex-col gap-1.5">
                  <span className="label">Modo de importación</span>
                  <select
                    className="input"
                    aria-label="Modo de importación"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'replace' | 'merge')}
                  >
                    <option value="replace">Reemplazar</option>
                    <option value="merge">Combinar</option>
                  </select>
                </label>
                <p className="text-caption text-graphite">
                  Reemplazar deja solo las cartas importadas; Combinar las suma a las actuales.
                </p>
              </div>

              {error && <ErrorBanner message={error} />}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleImport}
                  disabled={sending || (source === 'text' ? !text.trim() : !file)}
                >
                  {sending ? 'Importando…' : 'Importar mazo'}
                </button>
              </div>
            </>
          )}

          {step.kind === 'running' && (
            <div className="flex flex-col gap-2">
              <p className="text-body-sm text-graphite">{phaseLabel}</p>
              {job && (
                <>
                  <div className="h-2 rounded-full bg-silver/60 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: 'var(--sc, #b45309)' }}
                    />
                  </div>
                  <p className="text-caption text-graphite">
                    {processed} de {total} cartas
                  </p>
                </>
              )}
            </div>
          )}

          {step.kind === 'result' && job?.status === 'COMPLETED' && (
            <>
              {job.validation && (
                <div className="flex flex-col gap-2">
                  <span
                    className={`self-start px-4 py-1.5 rounded-full text-body-sm font-semibold ${DECK_STATUS_COLORS[job.validation.status]}`}
                  >
                    {DECK_STATUS_LABELS[job.validation.status]}
                  </span>
                  {job.validation.reasons.length > 0 && (
                    <ul className="list-disc pl-5 text-body-sm text-slate">
                      {job.validation.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {job.commander && (
                <p className="text-body font-medium text-ink">
                  Comandante: <span className="font-display">{job.commander}</span>
                  <ManaColorDots colors={job.commanderColors ?? []} size="md" />
                </p>
              )}

              <p className="text-caption text-graphite">
                {totalCount} carta{totalCount === 1 ? '' : 's'} · {cards.length} distinta
                {cards.length === 1 ? '' : 's'}
              </p>

              {unresolved.length > 0 && (
                <section className="flex flex-col gap-3 border-t border-silver/60 pt-3">
                  <h4 className="font-display text-heading-sm">Cartas sin resolver</h4>
                  {unresolved.map((u) => (
                    <div key={u.line} className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-body-sm text-graphite">
                          <span className="font-medium text-ink">
                            Línea {u.line}: {u.quantity}× {u.name}
                          </span>
                          <span className="block text-caption">
                            {u.reason === 'AMBIGUOUS' ? 'varias coincidencias' : 'no encontrada'}
                          </span>
                          <span className="block text-caption">{u.raw}</span>
                        </p>
                        <button type="button" className="btn-ghost !px-3 !py-1.5 text-body-sm" onClick={() => handleDismiss(u.line)}>
                          Ignorar
                        </button>
                      </div>
                      {u.candidates.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                          {u.candidates.map((c) => (
                            <div key={c.scryfallId} className="result-card p-2.5">
                              {c.imageUrl && (
                                <img src={c.imageUrl} alt="" className="w-12 h-16 object-cover rounded shrink-0" />
                              )}
                              <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                                <p className="font-display text-body-sm line-clamp-1">{c.name}</p>
                                <p className="text-caption text-graphite line-clamp-1">{c.setName || c.type}</p>
                                <div className="flex justify-end mt-auto">
                                  <button
                                    type="button"
                                    className="btn-primary !px-3 !py-1.5 text-body-sm"
                                    disabled={confirmBusy !== null}
                                    onClick={() => handleConfirmCandidate(u, c)}
                                  >
                                    {confirmBusy === c.scryfallId ? 'Añadiendo…' : 'Añadir'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {confirmError && <ErrorBanner message={confirmError} />}

              <div className="form-actions">
                <button type="button" className="btn-primary" onClick={onClose}>
                  Cerrar
                </button>
              </div>
            </>
          )}

          {step.kind === 'result' && job?.status !== 'COMPLETED' && (
            <>
              <ErrorBanner message={error || 'La importación falló.'} />
              <div className="form-actions">
                <button type="button" className="btn-primary" onClick={onClose}>
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}