import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBook, updateBook, deleteBook } from '../api/booksApi'
import BookForm from '../components/BookForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'

export default function BookEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBook(id)
      setBook(data)
    } catch (err) {
      setError(err.message || 'No se pudo cargar el libro.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleSubmit(payload) {
    await updateBook(id, payload)
    navigate('/', { replace: true })
  }

  async function confirmDelete() {
    setDeleteBusy(true)
    try {
      await deleteBook(id)
      navigate('/', { replace: true })
    } catch (err) {
      window.alert(err.message || 'No se pudo eliminar el libro.')
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <section className="max-w-3xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg mb-1">Editar libro</h1>
          <p className="text-body-md text-on-surface-variant">Actualiza los datos del libro.</p>
        </div>
        {book && !loading && (
          <button
            className="btn-ghost !text-red-600 hover:!bg-red-50"
            onClick={() => setDeleting(true)}
          >
            Eliminar
          </button>
        )}
      </div>

      {loading ? (
        <Spinner label="Cargando libro…" />
      ) : error ? (
        <EmptyState
          title="No se pudo cargar el libro"
          message={error}
          action={
            <button className="btn-primary mt-2" onClick={() => navigate('/')}>
              Volver a la colección
            </button>
          }
        />
      ) : (
        <BookForm initial={book} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
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
