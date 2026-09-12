import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBook, updateBook, deleteBook } from '../api/booksApi'
import type { Book, BookFormData } from '../types'
import BookForm from '../components/BookForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'

export default function BookEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [book, setBook] = useState<Book | null>(null)
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
      const data = await getBook(id)
      setBook(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el libro.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(payload: BookFormData) {
    if (!id) return
    await updateBook(id, payload)
    navigate('/coleccion', { replace: true })
  }

  async function confirmDelete() {
    if (!id) return
    setDeleteError(null)
    setDeleteBusy(true)
    try {
      await deleteBook(id)
      navigate('/coleccion', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el libro.'
      setDeleteError(message)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Libros", to: "/coleccion" }, { label: book?.title || 'Detalle', to: `/coleccion/${id}` }, { label: "Editar" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Editar libro</h1>
          <p className="text-body text-slate">Actualiza los datos del libro.</p>
        </div>
        {book && !loading && (
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
        <Spinner label="Cargando libro…" />
      ) : error ? (
        <EmptyState
          title="No se pudo cargar el libro"
          message={error}
          action={
            <button className="btn-primary mt-2" onClick={() => navigate('/coleccion')}>
              Volver a la colección
            </button>
          }
        />
      ) : (
        <BookForm initial={book ?? undefined} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
      )}

      <ConfirmDialog
        open={deleting}
        title="Eliminar libro"
        message={`¿Seguro que quieres eliminar "${book?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
