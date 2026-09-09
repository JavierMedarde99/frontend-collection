import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBoardGames, createBoardGame } from '../api/boardgamesApi'
import { BOARD_GAME_STATES } from '../constants/boardGames'
import { BoardGameStatus } from '../types'
import type { BoardGameFormData, BoardGameSearchResult } from '../types'
import Spinner from './Spinner'
import EmptyState from './EmptyState'
import ErrorBanner from './ErrorBanner'

function mapResultToGame(result: BoardGameSearchResult): Omit<BoardGameFormData, 'status'> {
  return {
    title: result.title || 'Sin título',
    description: result.description,
    yearPublished: result.yearPublished,
    minPlayers: result.minPlayers,
    maxPlayers: result.maxPlayers,
    minPlaytime: result.minPlaytime,
    maxPlaytime: result.maxPlaytime,
    publisher: result.publisher,
    designers: result.designers,
    categories: result.categories,
    mechanics: result.mechanics,
    imageUrl: result.imageUrl,
    thumbnailUrl: result.thumbnailUrl,
    bggRating: result.bggRating,
    bggId: result.bggId,
  }
}

export default function BoardGameSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BoardGameSearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const [selected, setSelected] = useState<BoardGameSearchResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [modalStatus, setModalStatus] = useState<BoardGameStatus>(BoardGameStatus.OWNED)
  const [modalNotes, setModalNotes] = useState('')
  const [modalDateAdded, setModalDateAdded] = useState('')

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await searchBoardGames(q)
      setResults(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo realizar la búsqueda.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddClick(result: BoardGameSearchResult) {
    setSelected(result)
    setSubmitError(null)
    setModalStatus(BoardGameStatus.OWNED)
    setModalNotes('')
    setModalDateAdded('')
  }

  async function handleConfirm() {
    if (!selected) return
    setSubmitError(null)
    setSaving(selected.bggId || selected.title)
    try {
      await createBoardGame({
        ...mapResultToGame(selected),
        status: modalStatus,
        notes: modalNotes.trim() || undefined,
        dateAdded: modalDateAdded || undefined,
      })
      setSelected(null)
      navigate('/boardgames')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo añadir el juego de mesa.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSearch} className="relative">
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-stone absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          className="input !pl-11 pr-28"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título…"
          aria-label="Búsqueda"
        />
        <button className="btn-primary !py-2 !px-3.5 absolute right-1.5 top-1/2 -translate-y-1/2" type="submit" disabled={loading}>
          Buscar
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading && <Spinner label="Buscando…" />}

      {!loading && results !== null && results.length === 0 && (
        <EmptyState title="Sin resultados" message={`No se encontraron resultados para "${query}".`} />
      )}

      {!loading && results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result) => (
            <article key={result.bggId || result.title} className="card card-hover flex gap-5">
              {result.thumbnailUrl || result.imageUrl ? (
                <img
                  src={result.thumbnailUrl || result.imageUrl}
                  alt={result.title}
                  className="w-20 h-28 object-cover rounded shadow-sm shrink-0 bg-paper"
                />
              ) : (
                <div className="w-20 h-28 rounded shrink-0 bg-paper border border-silver/60 flex items-center justify-center text-caption text-slate">
                  <span>Sin imagen</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-heading leading-snug mb-1">{result.title || 'Sin título'}</h3>
                <p className="text-caption text-slate mt-1">
                  {[
                    result.yearPublished ? `${result.yearPublished}` : null,
                    result.minPlayers || result.maxPlayers
                      ? `${result.minPlayers ?? '?'}–${result.maxPlayers ?? '?'} jug.`
                      : null,
                    result.bggRating !== undefined ? `★ ${result.bggRating}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {result.description && (
                  <p className="text-body text-slate line-clamp-2 mt-2">
                    {result.description}
                  </p>
                )}
                <button
                  className="btn-primary !px-4 !py-2 mt-4"
                  onClick={() => handleAddClick(result)}
                  disabled={saving === (result.bggId || result.title)}
                >
                  {saving === (result.bggId || result.title) ? 'Añadiendo…' : 'Añadir a mi colección'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md">
          <div role="dialog" aria-modal="true" className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-heading-sm mb-1 leading-snug">{selected.title}</h3>
            <p className="text-body text-graphite mb-5">
              {selected.yearPublished || 'Año desconocido'}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label">
                  Estado <span className="text-brand">*</span>
                </label>
                <select
                  className="input"
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as BoardGameStatus)}
                >
                  {Object.entries(BOARD_GAME_STATES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Fecha de adición</label>
                <input
                  className="input"
                  type="date"
                  value={modalDateAdded}
                  onChange={(e) => setModalDateAdded(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Notas personales</label>
                <textarea
                  className="input !h-auto !min-h-[80px] !py-3"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Notas personales…"
                />
              </div>
            </div>

            {submitError && <ErrorBanner message={submitError} />}

            <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
              <button
                className="btn-ghost"
                onClick={() => setSelected(null)}
                disabled={saving !== null}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={saving !== null}
              >
                {saving !== null ? 'Añadiendo…' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
