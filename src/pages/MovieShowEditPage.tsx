import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMovieShow, updateMovieShow, deleteMovieShow } from '../api/movieshowsApi'
import type { MovieShow, MovieShowFormData } from '../types'
import MovieShowForm from '../components/MovieShowForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

export default function MovieShowEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const notify = useToast()

  const [movieShow, setMovieShow] = useState<MovieShow | null>(null)
  usePageTitle((movieShow?.title ? `Editar ${movieShow.title}` : 'Editar película'))
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

  async function handleSubmit(payload: MovieShowFormData) {
    if (!id) return
    await updateMovieShow(id, payload)
    notify('Cambios guardados.')
    navigate('/movieshows', { replace: true })
  }

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

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Películas", to: "/movieshows" }, { label: movieShow?.title || 'Detalle', to: `/movieshows/${id}` }, { label: "Editar" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Editar película/serie</h1>
          <p className="text-body text-slate">Actualiza los datos.</p>
        </div>
        {movieShow && !loading && (
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
        <Spinner label="Cargando…" />
      ) : error ? (
        <EmptyState
          title="No se pudo cargar"
          message={error}
          action={
            <button className="btn-primary mt-2" onClick={() => navigate('/movieshows')}>
              Volver a la colección
            </button>
          }
        />
      ) : (
        <MovieShowForm initial={movieShow ?? undefined} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
      )}

      <ConfirmDialog
        open={deleting}
        title="Eliminar película/serie"
        message={`¿Seguro que quieres eliminar "${movieShow?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
