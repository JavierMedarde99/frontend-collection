import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listMagicCards, deleteMagicCard } from '../api/magicApi'
import { MAGIC_CARD_TYPES } from '../constants/magic'
import type { MagicCardResponse } from '../types'
import MagicCard from '../components/MagicCard'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import Pagination from '../components/Pagination'
import SearchField from '../components/SearchField'
import { useSearchShortcut } from '../hooks/useSearchShortcut'
import SortSelect from '../components/SortSelect'
import { usePagedList } from '../hooks/usePagedList'
import { usePageTitle } from '../hooks/usePageTitle'
import { useListQuery } from '../hooks/useListQuery'

const PAGE_SIZE = 12

const MAGIC_SORTS: { value: string; label: string }[] = [{ value: "name,asc", label: "Nombre A-Z" },{ value: "name,desc", label: "Nombre Z-A" },]

const RARITY_OPTIONS = ['common', 'uncommon', 'rare', 'mythic', 'special', 'bonus']

const COLOR_OPTIONS = [
  { value: 'W', label: 'Blanco' },
  { value: 'U', label: 'Azul' },
  { value: 'B', label: 'Negro' },
  { value: 'R', label: 'Rojo' },
  { value: 'G', label: 'Verde' },
]

export default function MagicListPage() {
  usePageTitle('Magic')
  const [nameInput, setNameInput] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  useSearchShortcut(searchRef)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [query, setQuery] = useListQuery({
    page: 0,
    name: '',
    rarity: '',
    color: '',
    type: '',
    sort: 'name,asc',
  })
  const { name: nameFilter, rarity: rarityFilter, color: colorFilter, type: typeFilter, sort, page } = query

  const {
    items: cards,
    totalPages,
    totalElements,
    loading,
    error,
    reload: load,
  } = usePagedList<MagicCardResponse>( {
    page,
    size: PAGE_SIZE,
    errorMessage: 'No se pudieron cargar las cartas Magic.',
    fetchPage: (page, size) => listMagicCards({
        page,
        size,
        name: nameFilter || undefined,
        rarity: rarityFilter || undefined,
        color: colorFilter || undefined,
        type: typeFilter || undefined,
        sort,
      }),
    deps: [nameFilter, rarityFilter, colorFilter, typeFilter, sort],
  })


  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setQuery({ name: nameInput.trim(), page: 0 })
  }

  function handleClearFilters() {
    setNameInput('')
    setQuery({ name: '', rarity: '', color: '', type: '', page: 0 })
  }

  const activeFilterCount =
    [nameFilter, rarityFilter, colorFilter, typeFilter].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0

  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Colección Magic</h1>
          <p className="text-body text-slate">
            {loading
              ? 'Cargando cartas…'
              : `${totalElements} carta${totalElements === 1 ? '' : 's'} en tu colección`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SortSelect value={sort} onChange={(v) => setQuery({ sort: v, page: 0 })} options={MAGIC_SORTS} />
          <button
            className="btn-ghost !px-5"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filtros-magic"
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
          {activeFilterCount > 0 && (
            <button className="btn-ghost !px-4" onClick={handleClearFilters}>
              Limpiar
            </button>
          )}
          <Link className="btn-primary" to="/magic/nuevo">
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
            Añadir carta Magic
          </Link>
        </div>
      </div>

      {filtersOpen && (
        <div id="filtros-magic" className="flex flex-col gap-5 animate-fade-in">
          <SearchField
            value={nameInput}
            onChange={setNameInput}
            onSubmit={handleSearch}
            placeholder="Buscar carta por nombre…"
            label="Buscar carta por nombre"
            inputRef={searchRef}
            shortcutHint
          />
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              className="input"
              value={rarityFilter}
              onChange={(e) => setQuery({ rarity: e.target.value, page: 0 })}
              aria-label="Filtrar por rareza"
            >
              <option value="">Todas las rarezas</option>
              {RARITY_OPTIONS.map((rarity) => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
            <select
              className="input"
              value={colorFilter}
              onChange={(e) => setQuery({ color: e.target.value, page: 0 })}
              aria-label="Filtrar por color"
            >
              <option value="">Todos los colores</option>
              {COLOR_OPTIONS.map((color) => (
                <option key={color.value} value={color.value}>{color.label} ({color.value})</option>
              ))}
            </select>
            <select
              className="input"
              value={typeFilter}
              onChange={(e) => setQuery({ type: e.target.value, page: 0 })}
              aria-label="Filtrar por tipo"
            >
              <option value="">Todos los tipos</option>
              {MAGIC_CARD_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </form>
        </div>
      )}

      {error && (
        <ErrorBanner message={error} />
      )}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : cards.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'Sin resultados' : 'No hay cartas Magic'}
          message={
            hasActiveFilters
              ? 'Ninguna carta coincide con los filtros actuales. Limpia los filtros para ver toda tu colección.'
              : 'Añade tu primera carta importándola desde Scryfall.'
          }
          action={
            hasActiveFilters ? (
              <button className="btn-ghost mt-2" onClick={handleClearFilters}>
                Limpiar filtros
              </button>
            ) : (
              <Link className="btn-primary mt-2" to="/magic/nuevo">
                Añadir carta
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <MagicCard key={card.id} card={card} index={idx}
              onDelete={async () => { await deleteMagicCard(card.id); load() }}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={(n) => setQuery({ page: n })} />
    </section>
  )
}
