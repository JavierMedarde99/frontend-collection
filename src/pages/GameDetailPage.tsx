import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBackFallback } from '../hooks/useBackFallback'
import { getGame, deleteGame, listGames, addGameAdditions } from '../api/gamesApi'
import { GameStatus, type AddGameAdditionItem, type Game } from '../types'
import GameStatusBadge from '../components/GameStatusBadge'
import GamePlatformBadge from '../components/GamePlatformBadge'
import { GAME_STATES, isPcPlatform, platformLabel } from '../constants/games'
import GenreBadges from '../components/GenreBadges'
import StarRating from '../components/StarRating'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import OwnerLine from '../components/OwnerLine'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import MetaList from '../components/MetaList'
import AddGameDlcsDialog from '../components/AddGameDlcsDialog'
import { COLLECTIONS_BY_KEY } from '../constants/collections'

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goBack = useBackFallback('/juegos')

  const [game, setGame] = useState<Game | null>(null)
  usePageTitle(game?.title || 'Videojuegos')
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [dlcs, setDlcs] = useState<Game[]>([])
  const [dlcsLoading, setDlcsLoading] = useState(false)
  const [dlcsError, setDlcsError] = useState<string | null>(null)
  const [addingDlcs, setAddingDlcs] = useState(false)
  const [addBusy, setAddBusy] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  /**
   * No hay endpoint por `parentId`: se piden con `type=dlc` (la lista sí filtra
   * por tipo) y se quedan las de este base. `owner=all` requiere sesión en el
   * backend; sin ella vale `other`.
   */
  const loadDlcs = useCallback(
    async (gameId: string) => {
      setDlcsLoading(true)
      setDlcsError(null)
      try {
        const size = 100
        const collected: Game[] = []
        let page = 0
        for (;;) {
          const res = await listGames({
            type: 'dlc',
            owner: isAuthenticated ? 'all' : 'other',
            viewerId: user?.id,
            page,
            size,
          })
          collected.push(...res.content)
          page += 1
          if (page >= res.totalPages) break
        }
        setDlcs(collected.filter((g) => g.parentId === gameId))
      } catch (err) {
        setDlcs([])
        setDlcsError(err instanceof Error ? err.message : 'No se pudo cargar el contenido adicional.')
      } finally {
        setDlcsLoading(false)
      }
    },
    [isAuthenticated, user?.id],
  )

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getGame(id)
      setGame(data)
      // En un DLC no se pide el bloque: se enseña su base en su lugar.
      if (data.parentId) {
        setDlcs([])
      } else {
        await loadDlcs(data.id)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el videojuego.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id, loadDlcs])

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

  async function handleAddDlcs(items: AddGameAdditionItem[]) {
    if (!id) return
    setAddBusy(true)
    setAddError(null)
    try {
      await addGameAdditions(id, items)
      setAddingDlcs(false)
      await loadDlcs(id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo añadir el contenido adicional.'
      setAddError(message)
    } finally {
      setAddBusy(false)
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
    ...(game.acquisitionDate ? [{ label: 'Fecha de obtención', value: game.acquisitionDate }] : []),
    ...(game.acquisitionPrice !== undefined && game.status !== GameStatus.WISHLIST
      ? [{ label: 'Precio de adquisición', value: `${game.acquisitionPrice} €` }]
      : []),
    ...(game.externalSource ? [{ label: 'Fuente externa', value: game.externalSource }] : []),
  ]

  const isOwner = isAuthenticated && (!game.userOwned?.username || game.userOwned.username === user?.username)
  const canAddDlcs =
    !game.parentId &&
    isOwner &&
    game.status !== GameStatus.WISHLIST &&
    Boolean(game.externalId) &&
    game.externalSource?.toUpperCase() === 'RAWG'

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.games.accent.spine, '--c': COLLECTIONS_BY_KEY.games.accent.niche } as CSSProperties}
    >
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Videojuegos", to: "/juegos" }, { label: game?.title || 'Detalle' }]} />
      <div className="flex items-center justify-between gap-4">
        <button className="btn-ghost !px-4 !py-2" onClick={goBack}>
          ← Volver
        </button>
        {isOwner && (
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
        )}
      </div>

      {deleteError && <ErrorBanner message={deleteError} />}

      <article className="card flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="cover-frame shrink-0">
            {game.thumbnailUrl ? (
              <img
                src={game.thumbnailUrl}
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
            <PageHeader eyebrow="Videojuegos" title={game.title} subtitle={platformLabel(game.platform)} />
            <OwnerLine owner={game.userOwned} />
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <GameStatusBadge status={game.status} />
              <GamePlatformBadge platform={game.platform} />
            </div>
            <GenreBadges genres={game.genres} className="mb-4" />
            <StarRating value={game.userRating} readOnly />
            {game.steamAppId && isPcPlatform(game.platform) && (
              <div className="mt-4">
                <Link className="btn-ghost !px-4 !py-2" to={`/juegos/${game.id}/logros`}>
                  Ver logros
                </Link>
              </div>
            )}
          </div>
        </div>

        {details.length > 0 && (
          <div className="border-t border-silver/60 pt-5">
            <MetaList columns={3} items={details} />
          </div>
        )}

        {game.comment && (
          <div className="border-t border-silver/60 pt-6">
            <h2 className="text-caption text-stone uppercase tracking-wide mb-1.5">Comentario</h2>
            <p className="text-body text-slate whitespace-pre-line">{game.comment}</p>
          </div>
        )}
      </article>

      {!game.parentId && (
        <article className="card flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-display text-heading-sm">Contenido adicional</h2>
            {canAddDlcs && (
              <button
                type="button"
                className="btn-primary !px-4 !py-2"
                onClick={() => {
                  setAddError(null)
                  setAddingDlcs(true)
                }}
              >
                Añadir contenido adicional
              </button>
            )}
          </div>

          {addError && <ErrorBanner message={addError} />}
          {dlcsError && <ErrorBanner message={dlcsError} />}

          {dlcsLoading ? (
            <Spinner label="Cargando contenido adicional…" />
          ) : !dlcsError && dlcs.length === 0 ? (
            <p className="text-body text-graphite">Todavía no tienes contenido adicional de este juego.</p>
          ) : dlcs.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dlcs.map((dlc) => (
                <li key={dlc.id}>
                  <Link
                    to={`/juegos/${dlc.id}`}
                    className="card card-hover !py-3 flex items-center gap-3"
                  >
                    {dlc.thumbnailUrl ? (
                      <img
                        src={dlc.thumbnailUrl}
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
                    <span className="min-w-0">
                      <span className="block text-body text-ink line-clamp-2">{dlc.title}</span>
                      <span className="block text-caption text-graphite">{GAME_STATES[dlc.status]}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      )}

      {game.parentId && (
        <p className="text-body text-slate">
          Contenido adicional de{' '}
          <Link className="text-brand hover:underline font-medium" to={`/juegos/${game.parentId}`}>
            {game.parentTitle || 'su juego base'}
          </Link>
        </p>
      )}

      {addingDlcs && (
        <AddGameDlcsDialog
          baseId={game.id}
          onSave={handleAddDlcs}
          onClose={() => setAddingDlcs(false)}
          busy={addBusy}
          saveError={addError}
        />
      )}

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
