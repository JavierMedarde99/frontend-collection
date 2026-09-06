import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchGames, createGame } from '../api/gamesApi'
import { GAME_PLATFORMS, GAME_STATES } from '../constants/games'
import { GamePlatform, GameStatus } from '../types'
import type { GameFormData, SearchGameResult } from '../types'
import Spinner from './Spinner'
import EmptyState from './EmptyState'
import ErrorBanner from './ErrorBanner'

function mapResultToGame(result: SearchGameResult): Omit<GameFormData, 'platform' | 'status'> {
  return {
    title: result.title || 'Sin título',
    thumbnailUrl: result.thumbnailUrl,
    externalSource: result.externalSource,
    externalId: result.id,
  }
}

export default function GameSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchGameResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState<string | null>(null)

  const [selected, setSelected] = useState<SearchGameResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [modalPlatform, setModalPlatform] = useState<GamePlatform>(GamePlatform.PC)
  const [modalStatus, setModalStatus] = useState<GameStatus>(GameStatus.WISHLIST)
  const [modalComment, setModalComment] = useState('')

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await searchGames(q)
      setResults(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo realizar la búsqueda.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddClick(result: SearchGameResult) {
    setSelected(result)
    setSubmitError(null)
    const platform = Object.values(GamePlatform).find((p) => p === result.platform)
    setModalPlatform(platform || GamePlatform.PC)
    setModalStatus(GameStatus.WISHLIST)
    setModalComment('')
  }

  async function handleConfirm() {
    if (!selected) return
    setSubmitError(null)
    setSearching(selected.id)
    try {
      await createGame({
        ...mapResultToGame(selected),
        platform: modalPlatform,
        status: modalStatus,
        comment: modalComment?.trim() || undefined,
      })
      setSelected(null)
      navigate('/juegos')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo añadir el videojuego.')
    } finally {
      setSearching(null)
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
            <article key={result.id} className="card card-hover flex gap-5">
              {result.thumbnailUrl ? (
                <img
                  src={result.thumbnailUrl}
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
                  {[result.platform, result.genre, result.publisher, result.developer]
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
                  disabled={searching === result.id}
                >
                  {searching === result.id ? 'Añadiendo…' : 'Añadir a mi colección'}
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
              {selected.platform || 'Plataforma desconocida'}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label">
                  Plataforma <span className="text-brand">*</span>
                </label>
                <select
                  className="input"
                  value={modalPlatform}
                  onChange={(e) => setModalPlatform(e.target.value as GamePlatform)}
                >
                  {Object.entries(GAME_PLATFORMS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Estado <span className="text-brand">*</span>
                </label>
                <select
                  className="input"
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as GameStatus)}
                >
                  {Object.entries(GAME_STATES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Comentario</label>
                <textarea
                  className="input !h-auto !min-h-[80px] !py-3"
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  placeholder="Notas personales…"
                />
              </div>
            </div>

            {submitError && <ErrorBanner message={submitError} />}

            <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
              <button
                className="btn-ghost"
                onClick={() => setSelected(null)}
                disabled={searching === selected.id}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={searching === selected.id}
              >
                {searching === selected.id ? 'Añadiendo…' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}