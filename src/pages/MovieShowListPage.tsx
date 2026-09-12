import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listMovieShows, deleteMovieShow } from '../api/movieshowsApi'
import { MEDIA_TYPES, MOVIE_SHOW_STATES } from '../constants/movieshows'
import { MediaType, MovieShowStatus, type MovieShow } from '../types'
import MovieShowCard from '../components/MovieShowCard'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import FilterPill from '../components/FilterPill'
import Pagination from '../components/Pagination'
import SearchField from '../components/SearchField'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import SortSelect from '../components/SortSelect'
import { usePagedList } from '../hooks/usePagedList'
import { usePageTitle } from '../hooks/usePageTitle'
import { useQueryState } from '../hooks/useQueryState'

const PAGE_SIZE = 12

const MOVIE_SORTS: { value: string; label: string }[] = [{ value: "title,asc", label: "Título A-Z" },{ value: "title,desc", label: "Título Z-A" },{ value: "releaseDate,desc", label: "Novedades" },]

export default function MovieShowListPage() {
  usePageTitle('Películas y series')
  const [status, setStatus] = useQueryState<MovieShowStatus | ''>('status', '')
  const [mediaTypeFilter, setMediaTypeFilter] = useQueryState<MediaType | ''>('mediaType', '')
  const [nameInput, setNameInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useSearchShortcut(searchRef)
  const [nameFilter, setNameFilter] = useQueryState('name', '')
  const [sort, setSort] = useQueryState('sort', 'title,asc')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const {
    items: movieShows,
    page,
    gotoPage,
    resetPage,
    totalPages,
    totalElements,
    loading,
    error,
    reload: load,
  } = usePagedList<MovieShow>( {
    size: PAGE_SIZE,
    errorMessage: 'No se pudieron cargar las películas/series.',
    fetchPage: (page, size) => listMovieShows({
        page,
        size,
        status: status || undefined,
        mediaType: mediaTypeFilter || undefined,
        name: nameFilter || undefined,
        sort,
      }),
    deps: [status, mediaTypeFilter, nameFilter, sort],
  })


  function handleNameSearch(e: FormEvent) {
    e.preventDefault()
    setNameFilter(nameInput.trim())
    resetPage()
  }

  function clearFilters() {
    setStatus('')
    setMediaTypeFilter('')
    setNameInput('')
    setNameFilter('')
    resetPage()
  }

  const hasActiveFilters = Boolean(status || mediaTypeFilter || nameFilter)

  const activeFilterCount = [mediaTypeFilter, nameFilter].filter(Boolean).length

  return (
    <section className="flex flex-col gap-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Mis películas y series</h1>
          <p className="text-body text-slate">
            {loading
              ? 'Cargando…'
              : `${totalElements} título${totalElements === 1 ? '' : 's'} en tu colección`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SortSelect value={sort} onChange={(v) => { setSort(v); resetPage() }} options={MOVIE_SORTS} />
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
          <Link className="btn-primary" to="/movieshows/nuevo">
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
            Añadir película/serie
          </Link>
        </div>
      </div>

      {filtersOpen && (
        <div id="filtros" className="flex flex-col gap-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <SearchField
            value={nameInput}
            onChange={setNameInput}
            onSubmit={handleNameSearch}
            placeholder="Buscar por título…"
            label="Buscar por título"
            inputRef={searchRef}
            shortcutHint
          />
            <select
              className="input md:w-48"
              value={mediaTypeFilter}
              onChange={(e) => { setMediaTypeFilter(e.target.value as MediaType); resetPage() }}
              aria-label="Filtrar por tipo"
            >
              <option value="">Películas y series</option>
              {Object.entries(MEDIA_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        <FilterPill active={!status} onClick={() => { setStatus(''); resetPage() }} label="Todos los estados">
          Todos
        </FilterPill>
        {Object.entries(MOVIE_SHOW_STATES).map(([key, label]) => (
          <FilterPill
            key={key}
            active={status === key}
            onClick={() => { setStatus(key as MovieShowStatus); resetPage() }}
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
      ) : movieShows.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'Sin resultados' : 'Aún no tienes películas ni series'}
          message={
            hasActiveFilters
              ? 'Ningún título coincide con los filtros actuales. Limpia los filtros para ver toda tu colección.'
              : 'Añade tu primera película o serie buscándola en TMDB o manualmente.'
          }
          action={
            hasActiveFilters ? (
              <button className="btn-ghost mt-2" onClick={clearFilters}>
                Limpiar filtros
              </button>
            ) : (
              <Link className="btn-primary mt-2" to="/movieshows/nuevo">
                Añadir película/serie
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {movieShows.map((movieShow, index) => (
            <MovieShowCard key={movieShow.id} movieShow={movieShow} index={index}
              onDelete={async () => { await deleteMovieShow(movieShow.id); load() }}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={gotoPage} disabled={loading} />
    </section>
  )
}
