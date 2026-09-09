import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBoardGame, updateBoardGame, deleteBoardGame } from '../api/boardgamesApi'
import type { BoardGame, BoardGameFormData } from '../types'
import BoardGameForm from '../components/BoardGameForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'

export default function BoardGameEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [game, setGame] = useState<BoardGame | null>(null)
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
    <section className="max-w-3xl flex flex-col gap-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Editar juego de mesa</h1>
          <p className="text-body text-slate">Actualiza los datos del juego.</p>
        </div>
        {game && !loading && (
          <button
            className="btn-ghost !text-red-600 hover:!bg-red-50 hover:!border-red-200"
            onClick={() => setDeleting(true)}
          >
            Eliminar
          </button>
        )}
      </div>

      {deleteError && <ErrorBanner message={deleteError} />}

      {loading ? (
        <Spinner label="Cargando juego…" />
      ) : error ? (
        <EmptyState
          title="No se pudo cargar el juego"
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
