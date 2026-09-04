import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBooks } from '../api/booksApi'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import BookCard from '../components/BookCard'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

const PAGE_SIZE = 12

export default function BookListPage() {
  const [books, setBooks] = useState([])
  const [status, setStatus] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [authorInput, setAuthorInput] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listBooks({
        page,
        size: PAGE_SIZE,
        state: status || undefined,
        type: typeFilter || undefined,
        name: nameFilter || undefined,
        author: authorFilter || undefined,
        sort: 'title,asc',
      })
      setBooks(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los libros.')
    } finally {
      setLoading(false)
    }
  }, [page, status, typeFilter, nameFilter, authorFilter])

  useEffect(() => {
    load()
  }, [load])

  function changeFilter(setter) {
    return (value) => {
      setter(value)
      setPage(0)
    }
  }

  function handleNameSearch(e) {
    e.preventDefault()
    setNameFilter(nameInput.trim())
    setPage(0)
  }

  function handleAuthorSearch(e) {
    e.preventDefault()
    setAuthorFilter(authorInput.trim())
    setPage(0)
  }

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-headline-lg mb-1">Mi colección</h1>
        <p className="text-body-md text-on-surface-variant">
          {loading
            ? 'Cargando libros…'
            : `${totalElements} libro${totalElements === 1 ? '' : 's'} en tu colección`}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleNameSearch} className="flex gap-3 flex-1">
            <input
              className="input flex-1"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Buscar por título…"
              aria-label="Buscar por título"
            />
            <button className="btn-primary !h-12" type="submit">
              Buscar
            </button>
          </form>
          <form onSubmit={handleAuthorSearch} className="flex gap-3 flex-1">
            <input
              className="input flex-1"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Filtrar por autor…"
              aria-label="Filtrar por autor"
            />
            <button className="btn-ghost !h-12" type="submit">
              Buscar
            </button>
          </form>
          <select
            className="input md:w-52"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0) }}
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(BOOK_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`btn-ghost !h-10 ${!status ? '!bg-charcoal !text-white' : ''}`}
            onClick={() => { setStatus(''); setPage(0) }}
          >
            Todos
          </button>
          {Object.entries(BOOK_STATES).map(([key, label]) => (
            <button
              key={key}
              className={`btn-ghost !h-10 ${status === key ? '!bg-charcoal !text-white' : ''}`}
              onClick={() => { setStatus(key); setPage(0) }}
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
          title="Sin resultados"
          message="No se encontraron libros con los filtros seleccionados."
          action={
            <Link className="btn-primary mt-2" to="/nuevo">
              Añadir libro
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
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
    </section>
  )
}
