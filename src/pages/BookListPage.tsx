import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listBooks, deleteBook } from '../api/booksApi'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import { BookType, BookState, type Book } from '../types'
import BookCard from '../components/BookCard'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import FilterPill from '../components/FilterPill'
import Pagination from '../components/Pagination'
import SearchField from '../components/SearchField'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import SortSelect from '../components/SortSelect'

const PAGE_SIZE = 12

const BOOK_SORTS: { value: string; label: string }[] = [{ value: "title,asc", label: "Título A-Z" },{ value: "title,desc", label: "Título Z-A" },{ value: "start,desc", label: "Mejor valorados" },]

export default function BookListPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [status, setStatus] = useState<BookState | ''>('')
  const [typeFilter, setTypeFilter] = useState<BookType | ''>('')
  const [nameInput, setNameInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useSearchShortcut(searchRef)
  const [authorInput, setAuthorInput] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [sort, setSort] = useState('title,asc')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

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
        sort,
      })
      setBooks(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los libros.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, status, typeFilter, nameFilter, authorFilter, sort])

  useEffect(() => {
    load()
  }, [load])

  function handleNameSearch(e: FormEvent) {
    e.preventDefault()
    setNameFilter(nameInput.trim())
    setPage(0)
  }

  function handleAuthorSearch(e: FormEvent) {
    e.preventDefault()
    setAuthorFilter(authorInput.trim())
    setPage(0)
  }

  const activeFilterCount =
    [typeFilter, nameFilter, authorFilter].filter(Boolean).length

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
        <div className="flex items-center gap-3 shrink-0">
          <SortSelect value={sort} onChange={(v) => { setSort(v); setPage(0) }} options={BOOK_SORTS} />
          <button
            className="btn-ghost !px-5"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filtros"
          >
            <svg
              aria-hidden="true"
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filtros
            {activeFilterCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-brand text-white text-caption font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <Link className="btn-primary" to="/nuevo">
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
      </div>

      {filtersOpen && (
        <div id="filtros" className="flex flex-col gap-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
          <SearchField
              value={nameInput}
              onChange={setNameInput}
              onSubmit={handleNameSearch}
              placeholder="Buscar por título…"
              label="Buscar por título"
              inputRef={searchRef}
              shortcutHint
            />
          <SearchField
              value={authorInput}
              onChange={setAuthorInput}
              onSubmit={handleAuthorSearch}
              placeholder="Filtrar por autor…"
              label="Filtrar por autor"
              variant="ghost"
            />
          <select
            className="input md:w-48"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as BookType); setPage(0) }}
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(BOOK_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        <FilterPill active={!status} onClick={() => { setStatus(''); setPage(0) }} label="Todos los estados">
          Todos
        </FilterPill>
        {Object.entries(BOOK_STATES).map(([key, label]) => (
          <FilterPill
            key={key}
            active={status === key}
            onClick={() => { setStatus(key as BookState); setPage(0) }}
            label={`Filtrar por estado: ${label}`}
          >
            {label}
          </FilterPill>
        ))}
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
            <BookCard key={book.id} book={book} index={index}
              onDelete={async () => { await deleteBook(book.id); load() }}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} disabled={loading} />
    </section>
  )
}
