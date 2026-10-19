import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBackFallback } from '../hooks/useBackFallback'
import { getBoardGame, deleteBoardGame, listBoardGames, addExpansions } from '../api/boardgamesApi'
import { BoardGameStatus, type BoardGame } from '../types'
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
import PageHeader from '../components/PageHeader'
import MetaList, { type MetaItem } from '../components/MetaList'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import AddExpansionsDialog from '../components/AddExpansionsDialog'

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

  const [expansions, setExpansions] = useState<BoardGame[]>([])
  const [expansionsLoading, setExpansionsLoading] = useState(false)
  const [expansionsError, setExpansionsError] = useState<string | null>(null)
  const [addingExpansions, setAddingExpansions] = useState(false)
  const [addBusy, setAddBusy] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  /**
   * Las expansiones propias no tienen endpoint por `parentId`: se piden con
   * `type=expansion` (la lista sí filtra por tipo) y se quedan las de este base.
   * `owner=all` requiere sesión en backend; sin ella vale `other`.
   */
  const loadExpansions = useCallback(
    async (gameId: string) => {
      setExpansionsLoading(true)
      setExpansionsError(null)
      try {
        const size = 100
        const collected: BoardGame[] = []
        let page = 0
        for (;;) {
          const res = await listBoardGames({
            type: 'expansion',
            owner: isAuthenticated ? 'all' : 'other',
            viewerId: user?.id,
            page,
            size,
          })
          collected.push(...res.content)
          page += 1
          if (page >= res.totalPages) break
        }
        setExpansions(collected.filter((g) => g.parentId === gameId))
      } catch (err) {
        setExpansions([])
        setExpansionsError(err instanceof Error ? err.message : 'No se pudieron cargar las expansiones.')
      } finally {
        setExpansionsLoading(false)
      }
    },
    [isAuthenticated, user?.id],
  )

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getBoardGame(id)
      setGame(data)
      // En una expansión no se pide el bloque: se enseña su base en su lugar.
      if (data.bggType === 'boardgameexpansion') {
        setExpansions([])
      } else {
        await loadExpansions(data.id)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el juego de mesa.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id, loadExpansions])

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

  async function handleAddExpansions(bggIds: string[]) {
    if (!id) return
    setAddBusy(true)
    setAddError(null)
    try {
      await addExpansions(id, bggIds)
      setAddingExpansions(false)
      await loadExpansions(id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron añadir las expansiones.'
      setAddError(message)
    } finally {
      setAddBusy(false)
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
    ...(game.acquisitionPrice !== undefined ? [{ label: 'Precio de adquisición', value: `${game.acquisitionPrice} €` }] : []),
    ...(game.difficulty ? [{ label: 'Dificultad', value: BOARD_GAME_DIFFICULTY_LABELS[game.difficulty] }] : []),
    ...(game.playCount !== undefined && game.playCount !== null
      ? [{ label: 'Jugadas', value: `${game.playCount} jugada${game.playCount === 1 ? '' : 's'}` }]
      : []),
    ...(game.lastPlayedDate ? [{ label: 'Última jugada', value: formatDateEs(game.lastPlayedDate) }] : []),
  ]

  const hasRating = game.bggRating !== undefined && game.bggRating !== null
  const hasPersonalRating = (game.personalRating ?? 0) > 0
  const isExpansion = game.bggType === 'boardgameexpansion'
  const isOwner = isAuthenticated && (!game.userOwned?.username || game.userOwned.username === user?.username)
  const canAddExpansions = !isExpansion && isOwner && game.status === BoardGameStatus.OWNED

  const metaItems: MetaItem[] = [
    ...details,
    ...(hasRating
      ? [{ label: 'Rating BGG', value: <StarRating value={bggRatingToStars(game.bggRating as number)} readOnly /> }]
      : []),
    ...(hasPersonalRating
      ? [{ label: 'Valoración personal', value: <StarRating value={game.personalRating} readOnly /> }]
      : []),
  ]

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.boardgames.accent.spine, '--c': COLLECTIONS_BY_KEY.boardgames.accent.niche } as CSSProperties}
    >
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Juegos de mesa", to: "/boardgames" }, { label: game?.title || 'Detalle' }]} />
      <div className="flex items-center justify-between gap-4">
        <button className="btn-ghost !px-4 !py-2" onClick={goBack}>
          ← Volver
        </button>
        {isOwner && (
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
          <div className="cover-frame shrink-0">
            {game.imageUrl || game.thumbnailUrl ? (
              <img
                src={game.imageUrl || game.thumbnailUrl}
                alt={game.title}
                className="w-full sm:w-48 h-72 object-cover"
              />
            ) : (
              <div className="w-full sm:w-48 h-72 rounded-[4px_10px_10px_4px] shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite">
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <PageHeader eyebrow="Juegos de mesa" title={game.title} />
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

        {metaItems.length > 0 && (
          <div className="border-t border-silver/60 pt-5">
            <MetaList columns={2} items={metaItems} />
          </div>
        )}

        {game.notes && (
          <div className="border-t border-silver/60 pt-6">
            <h2 className="text-caption text-stone uppercase tracking-wide mb-1.5">Notas personales</h2>
            <p className="text-body text-slate whitespace-pre-line">{game.notes}</p>
          </div>
        )}
      </article>

      {!isExpansion && (
        <article className="card flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-display text-heading-sm">Expansiones</h2>
            {canAddExpansions && (
              <button
                type="button"
                className="btn-primary !px-4 !py-2"
                onClick={() => {
                  setAddError(null)
                  setAddingExpansions(true)
                }}
              >
                Añadir expansiones
              </button>
            )}
          </div>

          {addError && <ErrorBanner message={addError} />}
          {expansionsError && <ErrorBanner message={expansionsError} />}

          {expansionsLoading ? (
            <Spinner label="Cargando expansiones…" />
          ) : !expansionsError && expansions.length === 0 ? (
            <p className="text-body text-graphite">Todavía no tienes expansiones de este juego.</p>
          ) : expansions.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expansions.map((exp) => (
                <li key={exp.id}>
                  <Link
                    to={`/boardgames/${exp.id}`}
                    className="card card-hover !py-3 flex items-center gap-3"
                  >
                    {exp.thumbnailUrl || exp.imageUrl ? (
                      <img
                        src={exp.thumbnailUrl || exp.imageUrl}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="w-10 h-14 object-cover rounded-md shrink-0"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="w-10 h-14 rounded-md shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60"
                      />
                    )}
                    <span className="text-body text-ink line-clamp-2">{exp.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      )}

      {isExpansion && game.parentId && (
        <p className="text-body text-slate">
          Expansión de{' '}
          <Link className="text-brand hover:underline font-medium" to={`/boardgames/${game.parentId}`}>
            {game.parentTitle || 'su juego base'}
          </Link>
        </p>
      )}

      {addingExpansions && (
        <AddExpansionsDialog
          baseId={game.id}
          onSave={handleAddExpansions}
          onClose={() => setAddingExpansions(false)}
          busy={addBusy}
        />
      )}

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
