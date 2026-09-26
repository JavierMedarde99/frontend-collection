import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBackFallback } from '../hooks/useBackFallback'
import { getBoardGame, deleteBoardGame } from '../api/boardgamesApi'
import type { BoardGame } from '../types'
import BoardGameStatusBadge from '../components/BoardGameStatusBadge'
import GenreBadges from '../components/GenreBadges'
import StarRating from '../components/StarRating'
import { BOARD_GAME_DIFFICULTY_LABELS, bggRatingToStars } from '../constants/boardGames'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import OwnerLine from '../components/OwnerLine'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'

function formatRange(min?: number, max?: number, suffix = ''): string | null {
  if (min === undefined && max === undefined) return null
  const range = min !== undefined && max !== undefined
    ? (min === max ? `${min}` : `${min}–${max}`)
    : `${min ?? max}`
  return suffix ? `${range} ${suffix}` : range
}

function formatDateEs(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BoardGameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useBackFallback('/boardgames')

  const [game, setGame] = useState<BoardGame | null>(null)
  usePageTitle(game?.title || 'Juegos de mesa')
  const { isAuthenticated, user } = useAuth()
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
      const data = await getBoardGame(id)
      setGame(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el juego de mesa.'
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
      await deleteBoardGame(id)
      navigate('/boardgames', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el juego de mesa.'
      setDeleteError(message)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <Spinner label="Cargando juego…" />
      </section>
    )
  }

  if (error || !game) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <EmptyState
          title="No se pudo cargar el juego"
          message={error || 'El juego no existe.'}
          action={
            <button className="btn-primary mt-2" onClick={goBack}>
              Volver a la colección
            </button>
          }
        />
      </section>
    )
  }

  const players = formatRange(game.minPlayers, game.maxPlayers, 'jug.')
  const duration = formatRange(game.minPlaytime, game.maxPlaytime, 'min')

  const details: { label: string; value: string }[] = [
    ...(game.yearPublished !== undefined ? [{ label: 'Año', value: `${game.yearPublished}` }] : []),
    ...(players ? [{ label: 'Jugadores', value: players }] : []),
    ...(duration ? [{ label: 'Duración', value: duration }] : []),
    ...(game.publisher ? [{ label: 'Editorial', value: game.publisher }] : []),
    ...(game.designers?.length ? [{ label: 'Diseñadores', value: game.designers.join(', ') }] : []),
    ...(game.categories?.length ? [{ label: 'Categorías', value: game.categories.join(', ') }] : []),
    ...(game.mechanics?.length ? [{ label: 'Mecánicas', value: game.mechanics.join(', ') }] : []),
    ...(game.dateAdded ? [{ label: 'En la colección desde', value: game.dateAdded }] : []),
    ...(game.difficulty ? [{ label: 'Dificultad', value: BOARD_GAME_DIFFICULTY_LABELS[game.difficulty] }] : []),
    ...(game.playCount !== undefined && game.playCount !== null
      ? [{ label: 'Jugadas', value: `${game.playCount} jugada${game.playCount === 1 ? '' : 's'}` }]
      : []),
    ...(game.lastPlayedDate ? [{ label: 'Última jugada', value: formatDateEs(game.lastPlayedDate) }] : []),
  ]

  const hasRating = game.bggRating !== undefined && game.bggRating !== null
  const hasPersonalRating = (game.personalRating ?? 0) > 0

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Juegos de mesa", to: "/boardgames" }, { label: game?.title || 'Detalle' }]} />
      <div className="flex items-center justify-between gap-4">
        <button className="btn-ghost !px-4 !py-2" onClick={goBack}>
          ← Volver
        </button>
        {isAuthenticated && (!game.userOwned?.username || game.userOwned.username === user?.username) && (
        <div className="flex items-center gap-2">
          <Link className="btn-ghost !px-4 !py-2" to={`/boardgames/${game.id}/editar`}>
            Editar
          </Link>
          <button
            className="btn-ghost !px-4 !py-2 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
            onClick={() => setDeleting(true)}
          >
            Eliminar
          </button>
        </div>
        )}
      </div>

      {deleteError && <ErrorBanner message={deleteError} />}

      <article className="card flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {game.imageUrl || game.thumbnailUrl ? (
            <img
              src={game.imageUrl || game.thumbnailUrl}
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
            <OwnerLine owner={game.userOwned} />
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <BoardGameStatusBadge status={game.status} />
            </div>
            <GenreBadges genres={game.genres} className="mb-4" />
            {game.description && (
              <p className="text-body text-slate whitespace-pre-line">{game.description}</p>
            )}
          </div>
        </div>

        {(details.length > 0 || hasRating || hasPersonalRating) && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-t border-silver/60 pt-6">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-caption text-stone uppercase tracking-wide">{d.label}</dt>
                <dd className="text-body text-ink font-medium mt-0.5">{d.value}</dd>
              </div>
            ))}
            {hasRating && (
              <div>
                <dt className="text-caption text-stone uppercase tracking-wide">Rating BGG</dt>
                <dd className="mt-1.5">
                  <StarRating value={bggRatingToStars(game.bggRating as number)} readOnly />
                </dd>
              </div>
            )}
            {hasPersonalRating && (
              <div>
                <dt className="text-caption text-stone uppercase tracking-wide">Valoración personal</dt>
                <dd className="mt-1.5">
                  <StarRating value={game.personalRating} readOnly />
                </dd>
              </div>
            )}
          </dl>
        )}

        {game.notes && (
          <div className="border-t border-silver/60 pt-6">
            <h2 className="text-caption text-stone uppercase tracking-wide mb-1.5">Notas personales</h2>
            <p className="text-body text-slate whitespace-pre-line">{game.notes}</p>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={deleting}
        title="Eliminar juego de mesa"
        message={`¿Seguro que quieres eliminar "${game.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
