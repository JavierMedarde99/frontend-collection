import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchGamesPage, createGame } from '../api/gamesApi'
import { GAME_PLATFORMS, GAME_STATES } from '../constants/games'
import { GamePlatform, GameStatus } from '../types'
import type { GameFormData, SearchGameResult } from '../types'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import Spinner from './Spinner'
import EmptyState from './EmptyState'
import StarRating from './StarRating'
import ErrorBanner from './ErrorBanner'
import SearchField from './SearchField'
import SkeletonInline from './SkeletonInline'

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
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [searching, setSearching] = useState<string | null>(null)

  const {
    items: results,
    hasMore,
    loading,
    loadingMore,
    error,
    sentinelRef,
  } = useInfiniteScroll<SearchGameResult>({
    size: 10,
    errorMessage: 'No se pudo realizar la búsqueda.',
    enabled: submitted !== null,
    fetchPage: (page, size) => searchGamesPage(submitted ?? '', page, size),
    deps: [submitted],
  })

  const [selected, setSelected] = useState<SearchGameResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [modalPlatform, setModalPlatform] = useState<GamePlatform>(GamePlatform.PC)
  const [modalStatus, setModalStatus] = useState<GameStatus>(GameStatus.WISHLIST)
  const [modalDateAdded, setModalDateAdded] = useState('')
  const [modalDateCompleted, setModalDateCompleted] = useState('')
  const [modalUserRating, setModalUserRating] = useState(0)
  const [modalComment, setModalComment] = useState('')
  const [modalObtainPlatinum, setModalObtainPlatinum] = useState(false)

  const showStartDate =
    modalStatus === GameStatus.PLAYING ||
    modalStatus === GameStatus.ABANDONED ||
    modalStatus === GameStatus.COMPLETED
  const showEndDate = modalStatus === GameStatus.COMPLETED
  const showRating = modalStatus === GameStatus.COMPLETED
  const showComment = modalStatus === GameStatus.COMPLETED

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setSubmitted(q)
  }

  function handleAddClick(result: SearchGameResult) {
    setSelected(result)
    setSubmitError(null)
    const platform = Object.values(GamePlatform).find((p) => p === result.platform)
    setModalPlatform(platform || GamePlatform.PC)
    setModalStatus(GameStatus.WISHLIST)
    setModalDateAdded('')
    setModalDateCompleted('')
    setModalUserRating(0)
    setModalComment('')
    setModalObtainPlatinum(false)
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
        dateAdded: (showStartDate && modalDateAdded) || undefined,
        dateCompleted: (showEndDate && modalDateCompleted) || undefined,
        userRating: showRating && modalUserRating ? modalUserRating : undefined,
        comment: showComment ? modalComment?.trim() || undefined : undefined,
        obtainPlatinum:
          modalPlatform === GamePlatform.PC && modalObtainPlatinum ? true : undefined,
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
      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={handleSearch}
        placeholder="Buscar por título…"
        label="Búsqueda"
        loading={loading}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading && <Spinner label="Buscando…" />}

      {!loading && submitted !== null && results.length === 0 && !error && (
        <EmptyState title="Sin resultados" message={`No se encontraron resultados para "${submitted}".`} />
      )}

      {!loading && results.length > 0 && (
        <>
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
          {loadingMore && <SkeletonInline count={2} />}
          {!hasMore && (
            <p className="text-body-sm text-graphite text-center" role="status">
              No hay más resultados
            </p>
          )}
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet">
          <div role="dialog" aria-modal="true" className="modal w-full max-w-md max-h-[90vh] overflow-y-auto">
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

              {modalPlatform === GamePlatform.PC && (
                <div>
                  <label className="label">Objetivo</label>
                  <label className="flex items-center gap-2.5 text-body cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-brand"
                      checked={modalObtainPlatinum}
                      onChange={(e) => setModalObtainPlatinum(e.target.checked)}
                    />
                    Platinar
                  </label>
                </div>
              )}

              {showStartDate && (
                <div>
                  <label className="label">Fecha de inicio</label>
                  <input
                    className="input"
                    type="date"
                    value={modalDateAdded}
                    onChange={(e) => setModalDateAdded(e.target.value)}
                  />
                </div>
              )}
              {showEndDate && (
                <div>
                  <label className="label">Fecha de fin</label>
                  <input
                    className="input"
                    type="date"
                    value={modalDateCompleted}
                    onChange={(e) => setModalDateCompleted(e.target.value)}
                  />
                </div>
              )}
              {showRating && (
                <div>
                  <label className="label">Valoración</label>
                  <div className="pt-2">
                    <StarRating value={modalUserRating} onChange={setModalUserRating} />
                  </div>
                </div>
              )}
              {showComment && (
                <div>
                  <label className="label">Comentario</label>
                  <textarea
                    className="input !h-auto !min-h-[80px] !py-3"
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    placeholder="Notas personales…"
                  />
                </div>
              )}
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