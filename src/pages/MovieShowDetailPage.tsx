import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMovieShow, deleteMovieShow } from '../api/movieshowsApi'
import type { MovieShow } from '../types'
import { MEDIA_TYPE_LABELS, MEDIA_TYPE_BADGE_COLORS } from '../constants/movieshows'
import MovieShowStatusBadge from '../components/MovieShowStatusBadge'
import StarRating from '../components/StarRating'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'

export default function MovieShowDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [movieShow, setMovieShow] = useState<MovieShow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getMovieShow(id)
      setMovieShow(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar la película/serie.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function confirmDelete() {
    if (!id) return
    setDeleteError(null)
    setDeleteBusy(true)
    try {
      await deleteMovieShow(id)
      navigate('/movieshows', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la película/serie.'
      setDeleteError(message)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <Spinner label="Cargando…" />
      </section>
    )
  }

  if (error || !movieShow) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <EmptyState
          title="No se pudo cargar"
          message={error || 'No existe.'}
          action={
            <button className="btn-primary mt-2" onClick={() => navigate('/movieshows')}>
              Volver a la colección
            </button>
          }
        />
      </section>
    )
  }

  const typeColor = MEDIA_TYPE_BADGE_COLORS[movieShow.mediaType]
  const year = movieShow.releaseDate ? movieShow.releaseDate.slice(0, 4) : null

  const details: { label: string; value: string }[] = [
    ...(year ? [{ label: 'Año', value: year }] : []),
    ...(movieShow.voteAverage !== undefined
      ? [{ label: 'Valoración TMDB', value: `★ ${movieShow.voteAverage}/10` }]
      : []),
    ...(movieShow.dateAdded ? [{ label: 'Fecha de inicio', value: movieShow.dateAdded }] : []),
    ...(movieShow.dateCompleted ? [{ label: 'Fecha de fin', value: movieShow.dateCompleted }] : []),
    ...(movieShow.externalSource ? [{ label: 'Fuente externa', value: movieShow.externalSource }] : []),
  ]

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <div className="flex items-center justify-between gap-4">
        <button className="btn-ghost !px-4 !py-2" onClick={() => navigate('/movieshows')}>
          ← Volver
        </button>
        <div className="flex items-center gap-2">
          <Link className="btn-ghost !px-4 !py-2" to={`/movieshows/editar/${movieShow.id}`}>
            Editar
          </Link>
          <button
            className="btn-ghost !px-4 !py-2 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
            onClick={() => setDeleting(true)}
          >
            Eliminar
          </button>
        </div>
      </div>

      {deleteError && <ErrorBanner message={deleteError} />}

      <article className="card flex flex-col gap-6">
        {movieShow.backdropUrl && (
          <img
            src={movieShow.backdropUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-48 object-cover rounded-xl shadow-sm bg-paper"
          />
        )}
        <div className="flex flex-col sm:flex-row gap-6">
          {movieShow.posterUrl ? (
            <img
              src={movieShow.posterUrl}
              alt={movieShow.title}
              className="w-full sm:w-48 h-72 object-cover rounded-xl shadow-sm bg-paper shrink-0"
            />
          ) : (
            <div className="w-full sm:w-48 h-72 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite">
              <span>Sin póster</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-heading-lg mb-2 leading-tight">{movieShow.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <MovieShowStatusBadge status={movieShow.status} />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium ${typeColor}`}>
                {MEDIA_TYPE_LABELS[movieShow.mediaType] || movieShow.mediaType}
              </span>
            </div>
            <StarRating value={movieShow.userRating} readOnly />
            {movieShow.overview && (
              <p className="text-body text-slate whitespace-pre-line mt-4">{movieShow.overview}</p>
            )}
          </div>
        </div>

        {details.length > 0 && (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 border-t border-silver/60 pt-6">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-caption text-stone uppercase tracking-wide">{d.label}</dt>
                <dd className="text-body text-ink font-medium mt-0.5">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {movieShow.comment && (
          <div className="border-t border-silver/60 pt-6">
            <h2 className="text-caption text-stone uppercase tracking-wide mb-1.5">Comentario</h2>
            <p className="text-body text-slate whitespace-pre-line">{movieShow.comment}</p>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={deleting}
        title="Eliminar película/serie"
        message={`¿Seguro que quieres eliminar "${movieShow.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
