import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchMovieShows, createMovieShow } from '../api/movieshowsApi'
import { MEDIA_TYPES, MOVIE_SHOW_STATES } from '../constants/movieshows'
import { MediaType, MovieShowStatus } from '../types'
import type { MovieShowFormData, SearchMovieShowResult } from '../types'
import Spinner from './Spinner'
import EmptyState from './EmptyState'
import StarRating from './StarRating'
import ErrorBanner from './ErrorBanner'

function mapResultToMovieShow(result: SearchMovieShowResult): Omit<MovieShowFormData, 'mediaType' | 'status'> {
  return {
    title: result.title || 'Sin título',
    overview: result.overview,
    releaseDate: result.releaseDate,
    posterUrl: result.posterUrl,
    backdropUrl: result.backdropUrl,
    voteAverage: result.voteAverage,
    externalSource: result.externalSource,
    externalId: result.externalId,
  }
}

export default function MovieShowSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | ''>('')
  const [results, setResults] = useState<SearchMovieShowResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const [selected, setSelected] = useState<SearchMovieShowResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [modalMediaType, setModalMediaType] = useState<MediaType>(MediaType.MOVIE)
  const [modalStatus, setModalStatus] = useState<MovieShowStatus>(MovieShowStatus.WISHLIST)
  const [modalDateAdded, setModalDateAdded] = useState('')
  const [modalDateCompleted, setModalDateCompleted] = useState('')
  const [modalUserRating, setModalUserRating] = useState(0)
  const [modalComment, setModalComment] = useState('')

  const showStartDate =
    modalStatus === MovieShowStatus.WATCHING ||
    modalStatus === MovieShowStatus.WATCHED
  const showEndDate = modalStatus === MovieShowStatus.WATCHED
  const showRating = modalStatus === MovieShowStatus.WATCHED
  const showComment = modalStatus === MovieShowStatus.WATCHED

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await searchMovieShows(q, mediaTypeFilter || undefined)
      setResults(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo realizar la búsqueda.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddClick(result: SearchMovieShowResult) {
    setSelected(result)
    setSubmitError(null)
    const mediaType = Object.values(MediaType).find((t) => t === result.mediaType)
    setModalMediaType(mediaType || MediaType.MOVIE)
    setModalStatus(MovieShowStatus.WISHLIST)
    setModalDateAdded('')
    setModalDateCompleted('')
    setModalUserRating(0)
    setModalComment('')
  }

  async function handleConfirm() {
    if (!selected) return
    setSubmitError(null)
    setSaving(selected.externalId)
    try {
      await createMovieShow({
        ...mapResultToMovieShow(selected),
        mediaType: modalMediaType,
        status: modalStatus,
        dateAdded: (showStartDate && modalDateAdded) || undefined,
        dateCompleted: (showEndDate && modalDateCompleted) || undefined,
        userRating: showRating && modalUserRating ? modalUserRating : undefined,
        comment: showComment ? modalComment?.trim() || undefined : undefined,
      })
      setSelected(null)
      navigate('/movieshows')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo añadir la película/serie.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
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
        </div>
        <select
          className="input md:w-48"
          value={mediaTypeFilter}
          onChange={(e) => setMediaTypeFilter(e.target.value as MediaType)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Películas y series</option>
          {Object.entries(MEDIA_TYPES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
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
            <article key={result.externalId} className="card card-hover flex gap-5">
              {result.posterUrl ? (
                <img
                  src={result.posterUrl}
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
                    result.releaseDate ? result.releaseDate.slice(0, 4) : null,
                    result.mediaType ? MEDIA_TYPES[result.mediaType] : null,
                    result.voteAverage !== undefined ? `★ ${result.voteAverage}/10` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {result.overview && (
                  <p className="text-body text-slate line-clamp-2 mt-2">
                    {result.overview}
                  </p>
                )}
                <button
                  className="btn-primary !px-4 !py-2 mt-4"
                  onClick={() => handleAddClick(result)}
                  disabled={saving === result.externalId}
                >
                  {saving === result.externalId ? 'Añadiendo…' : 'Añadir a mi colección'}
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
              {selected.releaseDate ? selected.releaseDate.slice(0, 4) : 'Año desconocido'}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label">
                  Tipo <span className="text-brand">*</span>
                </label>
                <select
                  className="input"
                  value={modalMediaType}
                  onChange={(e) => setModalMediaType(e.target.value as MediaType)}
                >
                  {Object.entries(MEDIA_TYPES).map(([key, label]) => (
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
                  onChange={(e) => setModalStatus(e.target.value as MovieShowStatus)}
                >
                  {Object.entries(MOVIE_SHOW_STATES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

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
                disabled={saving === selected.externalId}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={saving === selected.externalId}
              >
                {saving === selected.externalId ? 'Añadiendo…' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
