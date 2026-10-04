import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBook, updateBook, deleteBook } from '../api/booksApi'
import type { Book, BookFormData } from '../types'
import BookForm from '../components/BookForm'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

export default function BookEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const notify = useToast()

  const [book, setBook] = useState<Book | null>(null)
  usePageTitle((book?.title ? `Editar ${book.title}` : 'Editar libro'))
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
    notify('Cambios guardados.')
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
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.books.accent.spine, '--c': COLLECTIONS_BY_KEY.books.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Libros", to: "/coleccion" }, { label: book?.title || 'Detalle', to: `/coleccion/${id}` }, { label: "Editar" }]}
        eyebrow="Libros"
        title="Editar libro"
        subtitle="Actualiza los datos del libro."
        actions={
          book && !loading ? (
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
      </CreateShell>

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