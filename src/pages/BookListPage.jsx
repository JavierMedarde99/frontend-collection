import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBooks } from '../api/booksApi'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import BookCard from '../components/BookCard'
import SkeletonGrid from '../components/Skeleton'
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
    <section className="flex flex-col gap-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Mi colección</h1>
          <p className="text-body text-slate">
            {loading
              ? 'Cargando libros…'
              : `${totalElements} libro${totalElements === 1 ? '' : 's'} en tu colección`}
          </p>
        </div>
        <Link className="btn-primary shrink-0" to="/nuevo">
          <svg
            aria-hidden="true"
            className="w-4 h-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Añadir libro
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
          <form onSubmit={handleNameSearch} className="relative">
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-stone absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              className="input !pl-11 pr-28"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Buscar por título…"
              aria-label="Buscar por título"
            />
            <button className="btn-primary !py-2 !px-3.5 absolute right-1.5 top-1/2 -translate-y-1/2" type="submit">
              Buscar
            </button>
          </form>
          <form onSubmit={handleAuthorSearch} className="relative">
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-stone absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <input
              className="input !pl-11 pr-28"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Filtrar por autor…"
              aria-label="Filtrar por autor"
            />
            <button className="btn-ghost !py-2 !px-3.5 absolute right-1.5 top-1/2 -translate-y-1/2" type="submit">
              Buscar
            </button>
          </form>
          <select
            className="input md:w-48"
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

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
          <button
            className={`btn-ghost !px-4 !py-2 ${!status ? '!bg-brand !text-white !border-brand !shadow-brand-glow' : ''}`}
            onClick={() => { setStatus(''); setPage(0) }}
          >
            Todos
          </button>
          {Object.entries(BOOK_STATES).map(([key, label]) => (
            <button
              key={key}
              className={`btn-ghost !px-4 !py-2 ${status === key ? '!bg-brand !text-white !border-brand !shadow-brand-glow' : ''}`}
              onClick={() => { setStatus(key); setPage(0) }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={6} />
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
          {books.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4" aria-label="Paginación">
          <button
            className="btn-ghost !px-4 !py-2"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </button>
          <span className="text-body text-slate tabular-nums">
            Página {page + 1} de {totalPages}
          </span>
          <button
            className="btn-ghost !px-4 !py-2"
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