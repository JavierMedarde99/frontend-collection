import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listBoardGames } from '../api/boardgamesApi'
import { BOARD_GAME_STATES } from '../constants/boardGames'
import { BoardGameStatus, type BoardGame } from '../types'
import BoardGameCard from '../components/BoardGameCard'
import SkeletonGrid from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

const PAGE_SIZE = 12

export default function BoardGameListPage() {
  const [games, setGames] = useState<BoardGame[]>([])
  const [status, setStatus] = useState<BoardGameStatus | ''>('')
  const [nameInput, setNameInput] = useState('')
  const [nameFilter, setNameFilter] = useState('')
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
      const data = await listBoardGames({
        page,
        size: PAGE_SIZE,
        status: status || undefined,
        name: nameFilter || undefined,
        sort: 'title,asc',
      })
      setGames(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los juegos de mesa.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, status, nameFilter])

  useEffect(() => {
    load()
  }, [load])

  function handleNameSearch(e: FormEvent) {
    e.preventDefault()
    setNameFilter(nameInput.trim())
    setPage(0)
  }

  const activeFilterCount = [nameFilter].filter(Boolean).length

  return (
    <section className="flex flex-col gap-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Mis juegos de mesa</h1>
          <p className="text-body text-slate">
            {loading
              ? 'Cargando juegos de mesa…'
              : `${totalElements} juego${totalElements === 1 ? '' : 's'} en tu colección`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
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
          <Link className="btn-primary" to="/boardgames/nuevo">
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
            Añadir juego
          </Link>
        </div>
      </div>

      {filtersOpen && (
        <div id="filtros" className="flex flex-col gap-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
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
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por estado">
        <button
          className={`btn-ghost !px-4 !py-2 ${!status ? '!bg-brand !text-white !border-brand !shadow-brand-glow' : ''}`}
          onClick={() => { setStatus(''); setPage(0) }}
          aria-pressed={!status}
        >
          Todos
        </button>
        {Object.entries(BOARD_GAME_STATES).map(([key, label]) => (
          <button
            key={key}
            className={`btn-ghost !px-4 !py-2 ${status === key ? '!bg-brand !text-white !border-brand !shadow-brand-glow' : ''}`}
            onClick={() => { setStatus(key as BoardGameStatus); setPage(0) }}
          aria-pressed={status === key}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : games.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          message="No se encontraron juegos de mesa con los filtros seleccionados."
          action={
            <Link className="btn-primary mt-2" to="/boardgames/nuevo">
              Añadir juego
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <BoardGameCard key={game.id} game={game} index={index} />
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
