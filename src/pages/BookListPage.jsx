import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBooks, deleteBook } from '../api/booksApi'
import { BOOK_STATES } from '../constants/books'
import BookCard from '../components/BookCard'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'

const PAGE_SIZE = 12

export default function BookListPage() {
  const [books, setBooks] = useState([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listBooks({ page, size: PAGE_SIZE, state: status || undefined, sort: 'title,asc' })
      setBooks(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los libros.')
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    load()
  }, [load])

  function changeStatus(newStatus) {
    setStatus(newStatus)
    setPage(0)
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await deleteBook(deleting.id)
      setBooks((prev) => prev.filter((b) => b.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      window.alert(err.message || 'No se pudo eliminar el libro.')
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-headline-lg mb-1">Mi colección</h1>
          <p className="text-body-md text-on-surface-variant">
            {loading
              ? 'Cargando libros…'
              : `${totalElements} libro${totalElements === 1 ? '' : 's'} en tu colección`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`btn-ghost !h-10 ${!status ? '!bg-charcoal !text-white' : ''}`}
            onClick={() => changeStatus('')}
          >
            Todos
          </button>
          {Object.entries(BOOK_STATES).map(([key, label]) => (
            <button
              key={key}
              className={`btn-ghost !h-10 ${status === key ? '!bg-charcoal !text-white' : ''}`}
              onClick={() => changeStatus(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Cargando libros…" />
      ) : books.length === 0 ? (
        <EmptyState
          title={status ? 'Sin resultados para este filtro' : 'Tu colección está vacía'}
          message={
            status
              ? 'Prueba con otro estado o quita el filtro.'
              : 'Añade tu primer libro para empezar.'
          }
          action={
            !status && (
              <Link className="btn-primary mt-2" to="/nuevo">
                Añadir libro
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4">
          <button
            className="btn-ghost !h-10"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </button>
          <span className="text-body-md text-on-surface-variant">
            Página {page + 1} de {totalPages}
          </span>
          <button
            className="btn-ghost !h-10"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Siguiente
          </button>
        </nav>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar libro"
        message={`¿Seguro que quieres eliminar "${deleting?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
        busy={deleteBusy}
      />
    </section>
  )
}
