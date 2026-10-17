import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listFunkos, deleteFunko } from '../api/funkosApi'
import { FIGURE_STATUS_LABELS } from '../constants/figures'
import { FunkoStatus, type Funko } from '../types'
import FunkoCard from '../components/FunkoCard'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import FilterPill from '../components/FilterPill'
import SkeletonInline from '../components/SkeletonInline'
import SearchField from '../components/SearchField'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import SortSelect from '../components/SortSelect'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import OwnerTabs, { type OwnerTab } from '../components/OwnerTabs'
import { useListQuery } from '../hooks/useListQuery'
import PageHeader from '../components/PageHeader'
import { COLLECTIONS_BY_KEY } from '../constants/collections'

const PAGE_SIZE = 12

const FUNKO_SORTS: { value: string; label: string }[] = [
  { value: 'name,asc', label: 'Nombre A-Z' },
  { value: 'name,desc', label: 'Nombre Z-A' },
  { value: 'dateAdded,desc', label: 'Añadidos recientemente' },
]

export default function FunkoListPage() {
  usePageTitle('Funko Pop')
  const [nameInput, setNameInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useSearchShortcut(searchRef)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [query, setQuery] = useListQuery({
    status: '' as FunkoStatus | '',
    name: '',
    sort: 'name,asc',
  })
  const { status, name, sort } = query

  const { isAuthenticated } = useAuth()
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('mine')
  const effectiveTab = isAuthenticated ? ownerTab : 'other'

  const {
    items: funkos,
    totalElements,
    hasMore,
    loading,
    loadingMore,
    error,
    sentinelRef,
    reload,
  } = useInfiniteScroll<Funko>({
    size: PAGE_SIZE,
    errorMessage: 'No se pudieron cargar los Funko Pop.',
    fetchPage: (page, size) => listFunkos({ page, size, sort, name, status, owner: effectiveTab }),
    deps: [status, name, sort, effectiveTab],
  })

  async function handleDelete(id: string) {
    await deleteFunko(id)
    reload()
  }

  function handleNameSearch(e: FormEvent) {
    e.preventDefault()
    setQuery({ name: nameInput.trim() })
  }

  function clearFilters() {
    setNameInput('')
    setQuery({ status: '', name: '' })
  }

  const hasActiveFilters = Boolean(status || name)

  const activeFilterCount = [name].filter(Boolean).length

  return (
    <section
      className="flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.funkos.accent.spine, '--c': COLLECTIONS_BY_KEY.funkos.accent.niche } as CSSProperties}
    >
      <PageHeader
        eyebrow="Funko Pop"
        title="Colección de Funko Pop"
        subtitle={
          loading
            ? 'Cargando Funko Pop…'
            : `${totalElements} Funko${totalElements === 1 ? '' : 's'} en ${effectiveTab === 'other' ? 'varias colecciones' : 'tu colección'} · catálogo nº ${COLLECTIONS_BY_KEY.funkos.catalogNo}`
        }
        actions={
          <div className="flex items-center gap-3 shrink-0">
            <SortSelect value={sort} onChange={(v) => setQuery({ sort: v })} options={FUNKO_SORTS} />
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
              <Link className="btn-primary" to="/figuras/funkopop/nuevo">
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
                Añadir
              </Link>
            )}
          </div>
        }
      />

      {filtersOpen && (
        <div id="filtros" className="filterbar flex flex-col gap-5 animate-fade-in">
          <SearchField
            value={nameInput}
            onChange={setNameInput}
            onSubmit={handleNameSearch}
            placeholder="Buscar por nombre…"
            label="Buscar por nombre"
            inputRef={searchRef}
            shortcutHint
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        <FilterPill active={!status} onClick={() => setQuery({ status: '' })} label="Todos los estados">
          Todos
        </FilterPill>
        {Object.entries(FIGURE_STATUS_LABELS).map(([key, label]) => (
          <FilterPill
            key={key}
            active={status === key}
            onClick={() => setQuery({ status: key as FunkoStatus })}
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
      ) : funkos.length === 0 ? (
        <>
          <EmptyState
            variant={hasActiveFilters ? 'search' : 'empty'}
            title={(effectiveTab === 'other' && !hasActiveFilters) ? 'Nada por aquí todavía' : hasActiveFilters ? 'Sin resultados' : 'Aún no tienes Funko Pop'}
            message={
              hasActiveFilters
                ? 'Ningún Funko Pop coincide con los filtros actuales. Limpia los filtros para ver toda tu colección.'
                : (effectiveTab === 'other' && !hasActiveFilters) ? 'Ningún usuario ha añadido nada a esta colección todavía.'
                  : 'Añade tu primer Funko Pop buscándolo en el catálogo o manualmente.'
            }
            action={
              hasActiveFilters ? (
                <button className="btn-ghost mt-2" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              ) : effectiveTab === 'other' ? undefined : (
                <Link className="btn-primary mt-2" to="/figuras/funkopop/nuevo">
                  Añadir
                </Link>
              )
            }
          />
          {!hasActiveFilters && (
            <p className="statusline" role="status">— aún no hay catálogo —</p>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {funkos.map((funko, index) => (
              <FunkoCard
                key={funko.id}
                funko={funko}
                index={index}
                readOnly={effectiveTab === 'other'}
                onDelete={effectiveTab === 'mine' ? () => handleDelete(funko.id) : undefined}
              />
            ))}
          </div>
          {loadingMore && <SkeletonInline />}
          {!hasMore && (
            <p className="statusline" role="status">
              — fin del catálogo · {totalElements} Funko{totalElements === 1 ? '' : 's'} —
            </p>
          )}
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        </>
      )}
    </section>
  )
}
