import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGame, updateGame, deleteGame } from '../api/gamesApi'
import type { Game, GameFormData } from '../types'
import GameForm from '../components/GameForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

export default function GameEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const notify = useToast()

  const [game, setGame] = useState<Game | null>(null)
  usePageTitle((game?.title ? `Editar ${game.title}` : 'Editar videojuego'))
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

  async function handleSubmit(payload: GameFormData) {
    if (!id) return
    await updateGame(id, payload)
    notify('Cambios guardados.')
    navigate('/juegos', { replace: true })
  }

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

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.games.accent.spine, '--c': COLLECTIONS_BY_KEY.games.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Videojuegos", to: "/juegos" }, { label: game?.title || 'Detalle', to: `/juegos/${id}` }, { label: "Editar" }]}
        eyebrow="Videojuegos"
        title="Editar videojuego"
        subtitle="Actualiza los datos del videojuego."
        actions={
          game && !loading ? (
            <button
              className="btn-ghost !text-red-600 hover:!bg-red-50 hover:!border-red-200"
              onClick={() => setDeleting(true)}
            >
              Eliminar
            </button>
          ) : undefined
        }
      >
        {deleteError && <ErrorBanner message={deleteError} />}

        {loading ? (
          <Spinner label="Cargando videojuego…" />
        ) : error ? (
          <EmptyState
            title="No se pudo cargar el videojuego"
            message={error}
            action={
              <button className="btn-primary mt-2" onClick={() => navigate('/juegos')}>
                Volver a la colección
              </button>
            }
          />
        ) : (
          <GameForm initial={game ?? undefined} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
        )}
      </CreateShell>

      <ConfirmDialog
        open={deleting}
        title="Eliminar videojuego"
        message={`¿Seguro que quieres eliminar "${game?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}