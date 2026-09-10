import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listMagicCards } from '../api/magicApi'
import type { MagicCardResponse } from '../types'
import MagicCard from '../components/MagicCard'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

const PAGE_SIZE = 12

const RARITY_OPTIONS = ['common', 'uncommon', 'rare', 'mythic', 'special', 'bonus']

const COLOR_OPTIONS = [
  { value: 'W', label: 'Blanco' },
  { value: 'U', label: 'Azul' },
  { value: 'B', label: 'Negro' },
  { value: 'R', label: 'Rojo' },
  { value: 'G', label: 'Verde' },
]

export default function MagicListPage() {
  const [cards, setCards] = useState<MagicCardResponse[]>([])
  const [nameInput, setNameInput] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [colorFilter, setColorFilter] = useState('')
  const [typeInput, setTypeInput] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
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
      const data = await listMagicCards({
        page,
        size: PAGE_SIZE,
        name: nameFilter || undefined,
        rarity: rarityFilter || undefined,
        color: colorFilter || undefined,
        type: typeFilter || undefined,
        sort: 'name,asc',
      })
      setCards(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las cartas Magic.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, nameFilter, rarityFilter, colorFilter, typeFilter])

  useEffect(() => {
    load()
  }, [load])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setNameFilter(nameInput.trim())
    setTypeFilter(typeInput.trim())
    setPage(0)
  }

  function handleClearFilters() {
    setNameInput('')
    setNameFilter('')
    setRarityFilter('')
    setColorFilter('')
    setTypeInput('')
    setTypeFilter('')
    setPage(0)
  }

  const activeFilterCount =
    [nameFilter, rarityFilter, colorFilter, typeFilter].filter(Boolean).length

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

      <div className="flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
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
              placeholder="Buscar carta por nombre…"
              aria-label="Buscar carta por nombre"
            />
            <button className="btn-primary !py-2 !px-3.5 absolute right-1.5 top-1/2 -translate-y-1/2" type="submit">
              Buscar
            </button>
          </form>
          <div className="flex items-center gap-3 shrink-0">
            <button
              className="btn-ghost !px-5"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="filtros-magic"
            >
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
          </div>
        </div>

        {filtersOpen && (
          <form id="filtros-magic" onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
            <select
              className="input"
              value={rarityFilter}
              onChange={(e) => { setRarityFilter(e.target.value); setPage(0) }}
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
              onChange={(e) => { setColorFilter(e.target.value); setPage(0) }}
              aria-label="Filtrar por color"
            >
              <option value="">Todos los colores</option>
              {COLOR_OPTIONS.map((color) => (
                <option key={color.value} value={color.value}>{color.label} ({color.value})</option>
              ))}
            </select>
            <input
              className="input"
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              placeholder="Filtrar por tipo…"
              aria-label="Filtrar por tipo"
            />
          </form>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={8} />
      ) : cards.length === 0 ? (
        <EmptyState
          title="No hay cartas Magic"
          description="Aún no has añadido ninguna carta a tu colección o la búsqueda no arrojó resultados."
          actionText="Añadir carta"
          actionTo="/magic/nuevo"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <MagicCard key={card.id} card={card} index={idx} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            className="btn-ghost"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Anterior
          </button>
          <span className="text-body-sm text-graphite">
            Página {page + 1} de {totalPages}
          </span>
          <button
            className="btn-ghost"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  )
}
