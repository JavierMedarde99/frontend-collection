import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBoardGame, updateBoardGame, deleteBoardGame } from '../api/boardgamesApi'
import type { BoardGame, BoardGameFormData } from '../types'
import BoardGameForm from '../components/BoardGameForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

export default function BoardGameEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const notify = useToast()

  const [game, setGame] = useState<BoardGame | null>(null)
  usePageTitle((game?.title ? `Editar ${game.title}` : 'Editar juego'))
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

  async function handleSubmit(payload: BoardGameFormData) {
    if (!id) return
    await updateBoardGame(id, payload)
    notify('Cambios guardados.')
    navigate('/boardgames', { replace: true })
  }

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

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.boardgames.accent.spine, '--c': COLLECTIONS_BY_KEY.boardgames.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Juegos de mesa", to: "/boardgames" }, { label: game?.title || 'Detalle', to: `/boardgames/${id}` }, { label: "Editar" }]}
        eyebrow="Juegos de mesa"
        title="Editar juego de mesa"
        subtitle="Actualiza los datos del juego de mesa."
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
          <Spinner label="Cargando juego de mesa…" />
        ) : error ? (
          <EmptyState
            title="No se pudo cargar el juego de mesa"
            message={error}
            action={
              <button className="btn-primary mt-2" onClick={() => navigate('/boardgames')}>
                Volver a la colección
              </button>
            }
          />
        ) : (
          <BoardGameForm initial={game ?? undefined} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
        )}
      </CreateShell>

      <ConfirmDialog
        open={deleting}
        title="Eliminar juego de mesa"
        message={`¿Seguro que quieres eliminar "${game?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}