import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBook, deleteBook } from '../api/booksApi'
import type { Book } from '../types'
import { TYPE_LABELS, TYPE_BADGE_COLORS } from '../constants/books'
import StatusBadge from '../components/StatusBadge'
import StarRating from '../components/StarRating'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBanner from '../components/ErrorBanner'

export default function BookDetailPage() {
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

  if (loading) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <Spinner label="Cargando libro…" />
      </section>
    )
  }

  if (error || !book) {
    return (
      <section className="max-w-3xl flex flex-col gap-24">
        <EmptyState
          title="No se pudo cargar el libro"
          message={error || 'El libro no existe.'}
          action={
            <button className="btn-primary mt-2" onClick={() => navigate('/coleccion')}>
              Volver a la colección
            </button>
          }
        />
      </section>
    )
  }

  const typeColor = TYPE_BADGE_COLORS[book.type] || TYPE_BADGE_COLORS.NOVEL

  const details: { label: string; value: string }[] = [
    ...(book.pages !== undefined ? [{ label: 'Páginas', value: `${book.pages}` }] : []),
    ...(book.startDate ? [{ label: 'Fecha de inicio', value: book.startDate }] : []),
    ...(book.endDate ? [{ label: 'Fecha de fin', value: book.endDate }] : []),
  ]

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <div className="flex items-center justify-between gap-4">
        <button className="btn-ghost !px-4 !py-2" onClick={() => navigate('/coleccion')}>
          ← Volver
        </button>
        <div className="flex items-center gap-2">
          <Link className="btn-ghost !px-4 !py-2" to={`/editar/${book.id}`}>
            Editar
          </Link>
          <button
            className="btn-ghost !px-4 !py-2 !text-red-600 hover:!bg-red-50 hover:!border-red-200"
            onClick={() => setDeleting(true)}
          >
            Eliminar
          </button>
        </div>
      </div>

      {deleteError && <ErrorBanner message={deleteError} />}

      <article className="card flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {book.frontpage ? (
            <img
              src={book.frontpage}
              alt={book.title}
              className="w-full sm:w-48 h-72 object-cover rounded-xl shadow-sm bg-paper shrink-0"
            />
          ) : (
            <div className="w-full sm:w-48 h-72 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex items-center justify-center text-caption text-graphite">
              <span>Sin portada</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-heading-lg mb-1 leading-tight">{book.title}</h1>
            <p className="text-body text-graphite mb-4">{book.author}</p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <StatusBadge state={book.state} />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium ${typeColor}`}>
                {TYPE_LABELS[book.type] || book.type}
              </span>
            </div>
            <StarRating value={book.start} readOnly />
            {book.descripcion && (
              <p className="text-body text-slate whitespace-pre-line mt-4">{book.descripcion}</p>
            )}
          </div>
        </div>

        {details.length > 0 && (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 border-t border-silver/60 pt-6">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-caption text-stone uppercase tracking-wide">{d.label}</dt>
                <dd className="text-body text-ink font-medium mt-0.5">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {book.comment && (
          <div className="border-t border-silver/60 pt-6">
            <h2 className="text-caption text-stone uppercase tracking-wide mb-1.5">Comentario</h2>
            <p className="text-body text-slate whitespace-pre-line">{book.comment}</p>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={deleting}
        title="Eliminar libro"
        message={`¿Seguro que quieres eliminar "${book.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
        busy={deleteBusy}
      />
    </section>
  )
}
