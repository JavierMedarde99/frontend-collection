import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBackFallback } from '../hooks/useBackFallback'
import { getGame, deleteGame } from '../api/gamesApi'
import { GamePlatform, type Game } from '../types'
import GameStatusBadge from '../components/GameStatusBadge'
import GamePlatformBadge from '../components/GamePlatformBadge'
import StarRating from '../components/StarRating'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import { usePageTitle } from '../hooks/usePageTitle'

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useBackFallback('/juegos')

  const [game, setGame] = useState<Game | null>(null)
  usePageTitle(game?.title || 'Videojuegos')
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
      const data = await getGame(id)
      setGame(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el videojuego.'
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
      await deleteGame(id)
      navigate('/juegos', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el videojuego.'
      setDeleteError(message)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <Spinner label="Cargando videojuego…" />
      </section>
    )
  }

  if (error || !game) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <EmptyState
          title="No se pudo cargar el videojuego"
          message={error || 'El videojuego no existe.'}
          action={
            <button className="btn-primary mt-2" onClick={goBack}>
              Volver a la colección
            </button>
          }
        />
      </section>
    )
  }

  const details: { label: string; value: string }[] = [
    ...(game.dateAdded ? [{ label: 'Fecha de inicio', value: game.dateAdded }] : []),
    ...(game.dateCompleted ? [{ label: 'Fecha de fin', value: game.dateCompleted }] : []),
    ...(game.externalSource ? [{ label: 'Fuente externa', value: game.externalSource }] : []),
  ]

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Videojuegos", to: "/juegos" }, { label: game?.title || 'Detalle' }]} />
      <div className="flex items-center justify-between gap-4">
        <button className="btn-ghost !px-4 !py-2" onClick={goBack}>
          ← Volver
        </button>
        <div className="flex items-center gap-2">
          <Link className="btn-ghost !px-4 !py-2" to={`/juegos/editar/${game.id}`}>
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
        <div className="flex flex-col sm:flex-row gap-6">
          {game.thumbnailUrl ? (
            <img
              src={game.thumbnailUrl}
              alt={game.title}
              className="w-full sm:w-48 h-72 object-cover rounded-xl shadow-sm bg-paper shrink-0"
            />
          ) : (
            <div className="w-full sm:w-48 h-72 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite">
              <span>Sin imagen</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-heading-lg mb-2 leading-tight">{game.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <GameStatusBadge status={game.status} />
              <GamePlatformBadge platform={game.platform} />
            </div>
            <StarRating value={game.userRating} readOnly />
            {game.steamAppId && game.platform === GamePlatform.PC && (
              <div className="mt-4">
                <Link className="btn-ghost !px-4 !py-2" to={`/juegos/${game.id}/logros`}>
                  Ver logros
                </Link>
              </div>
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

        {game.comment && (
          <div className="border-t border-silver/60 pt-6">
            <h2 className="text-caption text-stone uppercase tracking-wide mb-1.5">Comentario</h2>
            <p className="text-body text-slate whitespace-pre-line">{game.comment}</p>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={deleting}
        title="Eliminar videojuego"
        message={`¿Seguro que quieres eliminar "${game.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
