import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGame, updateGame, deleteGame } from '../api/gamesApi'
import type { Game, GameFormData } from '../types'
import GameForm from '../components/GameForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'

export default function GameEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [game, setGame] = useState<Game | null>(null)
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
    <section className="max-w-3xl flex flex-col gap-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Editar videojuego</h1>
          <p className="text-body text-slate">Actualiza los datos del videojuego.</p>
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