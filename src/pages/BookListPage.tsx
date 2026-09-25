import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { listBooks, deleteBook } from '../api/booksApi'
import { listBookGenres } from '../api/booksApi'
import { useGenreOptions } from '../hooks/useGenreOptions'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import { BookType, BookState, type Book } from '../types'
import BookCard from '../components/BookCard'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import FilterPill from '../components/FilterPill'
import GenreSelect from '../components/GenreSelect'
import SkeletonInline from '../components/SkeletonInline'
import SearchField from '../components/SearchField'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import SortSelect from '../components/SortSelect'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import OwnerTabs, { type OwnerTab } from '../components/OwnerTabs'
import { useListQuery } from '../hooks/useListQuery'

const PAGE_SIZE = 12

const BOOK_SORTS: { value: string; label: string }[] = [{ value: "title,asc", label: "Título A-Z" },{ value: "title,desc", label: "Título Z-A" },{ value: "start,desc", label: "Mejor valorados" },]

export default function BookListPage() {
  usePageTitle('Libros')
  const [nameInput, setNameInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useSearchShortcut(searchRef)
  const [authorInput, setAuthorInput] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [query, setQuery] = useListQuery({
    status: '' as BookState | '',
    type: '' as BookType | '',
    genre: [] as string[],
    name: '',
    author: '',
    sort: 'title,asc',
  })
  const { status, type: typeFilter, genre: genreFilter, name: nameFilter, author: authorFilter, sort } = query
  const genreOptions = useGenreOptions(listBookGenres)

  const { isAuthenticated, user } = useAuth()
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('mine')
  const effectiveTab = isAuthenticated ? ownerTab : 'other'

  const {
    items: books,
    totalElements,
    hasMore,
    loading,
    loadingMore,
    error,
    sentinelRef,
    reload: load,
  } = useInfiniteScroll<Book>({
    size: PAGE_SIZE,
    errorMessage: 'No se pudieron cargar los libros.',
    fetchPage: (page, size) =>
      listBooks({
        page,
        size,
        state: status || undefined,
        type: typeFilter || undefined,
        genre: genreFilter || undefined,
        name: nameFilter || undefined,
        author: authorFilter || undefined,
        owner: effectiveTab,
        viewerId: user?.id || undefined,
        sort,
      }),
    deps: [status, typeFilter, genreFilter, nameFilter, authorFilter, sort, effectiveTab, user?.id],
  })

  function handleNameSearch(e: FormEvent) {
    e.preventDefault()
    setQuery({ name: nameInput.trim() })
  }

  function handleAuthorSearch(e: FormEvent) {
    e.preventDefault()
    setQuery({ author: authorInput.trim() })
  }

  function clearFilters() {
    setNameInput('')
    setAuthorInput('')
    setQuery({ status: '', type: '', genre: [], name: '', author: '' })
  }

  const hasActiveFilters = Boolean(status || typeFilter || genreFilter.length > 0 || nameFilter || authorFilter)

  const activeFilterCount =
    [typeFilter, nameFilter, authorFilter].filter(Boolean).length + genreFilter.length

  return (
    <section className="flex flex-col gap-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Colección de libros</h1>
          <p className="text-body text-slate">
            {loading
              ? 'Cargando libros…'
              : `${totalElements} libro${totalElements === 1 ? '' : 's'} en ${effectiveTab === 'other' ? 'varias colecciones' : 'tu colección'}`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SortSelect value={sort} onChange={(v) => setQuery({ sort: v })} options={BOOK_SORTS} />
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
          {effectiveTab === 'mine' && (
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
          )}
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
            onChange={(e) => setQuery({ type: e.target.value as BookType })}
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(BOOK_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="label" id="filtro-genero-label">Géneros</span>
          <div role="group" aria-labelledby="filtro-genero-label">
            <GenreSelect
              options={genreOptions}
              value={genreFilter}
              onChange={(genres) => setQuery({ genre: genres })}
              dropdown
              allowCustom={false}
            />
          </div>
        </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        <FilterPill active={!status} onClick={() => setQuery({ status: '' })} label="Todos los estados">
          Todos
        </FilterPill>
        {Object.entries(BOOK_STATES).map(([key, label]) => (
          <FilterPill
            key={key}
            active={status === key}
            onClick={() => setQuery({ status: key as BookState })}
            label={`Filtrar por estado: ${label}`}
          >
            {label}
          </FilterPill>
        ))}
      </div>

      <OwnerTabs value={effectiveTab} onChange={setOwnerTab} showMine={isAuthenticated} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : books.length === 0 ? (
        <EmptyState
          title={(effectiveTab === 'other' && !hasActiveFilters) ? 'Nada por aquí todavía' : hasActiveFilters ? 'Sin resultados' : 'Aún no tienes libros'}
          message={
            hasActiveFilters
              ? 'Ningún libro coincide con los filtros actuales. Limpia los filtros para ver toda tu colección.'
              : (effectiveTab === 'other' && !hasActiveFilters) ? 'Ningún usuario ha añadido nada a esta colección todavía.'
              : 'Añade tu primer libro buscándolo en Google Books o manualmente.'
          }
          action={
            hasActiveFilters ? (
              <button className="btn-ghost mt-2" onClick={clearFilters}>
                Limpiar filtros
              </button>
            ) : effectiveTab === 'other' ? undefined : (
              <Link className="btn-primary mt-2" to="/nuevo">
                Añadir libro
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index}
                readOnly={effectiveTab === 'other'}
                onDelete={async () => { await deleteBook(book.id); load() }}
              />
            ))}
          </div>
          {loadingMore && <SkeletonInline />}
          {!hasMore && (
            <p className="text-body-sm text-graphite text-center" role="status">
              No hay más libros
            </p>
          )}
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        </>
      )}
    </section>
  )
}
