import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { listBooks } from '../api/booksApi'
import { listGames } from '../api/gamesApi'
import { listMagicCards } from '../api/magicApi'
import { listDecks } from '../api/deckApi'
import { listBoardGames } from '../api/boardgamesApi'
import { listMovieShows } from '../api/movieshowsApi'
import Spinner from './Spinner'

interface GlobalResult {
  key: string
  title: string
  subtitle?: string
  to: string
}

interface ResultGroup {
  kind: string
  items: GlobalResult[]
}

async function searchAll(query: string): Promise<ResultGroup[]> {
  const [books, games, magic, decks, boardGames, movieShows] = await Promise.all([
    listBooks({ page: 0, size: 5, name: query }).catch(() => null),
    listGames({ page: 0, size: 5, name: query }).catch(() => null),
    listMagicCards({ page: 0, size: 5, name: query }).catch(() => null),
    listDecks(query).catch(() => []),
    listBoardGames({ page: 0, size: 5, name: query }).catch(() => null),
    listMovieShows({ page: 0, size: 5, name: query }).catch(() => null),
  ])
  const groups: ResultGroup[] = []
  const push = (kind: string, items: GlobalResult[]) => {
    if (items.length > 0) groups.push({ kind, items })
  }
  push('Libros', (books?.content || []).map((b) => ({ key: `book-${b.id}`, title: b.title, subtitle: b.author, to: `/coleccion/${b.id}` })))
  push('Videojuegos', (games?.content || []).map((g) => ({ key: `game-${g.id}`, title: g.title, to: `/juegos/${g.id}` })))
  push('Magic', (magic?.content || []).map((c) => ({ key: `magic-${c.id}`, title: c.name, subtitle: c.setName, to: `/magic/${c.id}` })))
  push('Mazos', (decks || []).map((d) => ({ key: `deck-${d.id}`, title: d.name, subtitle: d.commander, to: `/magic/mazos/${d.id}` })))
  push('Juegos de mesa', (boardGames?.content || []).map((g) => ({ key: `board-${g.id}`, title: g.title, to: `/boardgames/${g.id}` })))
  push('Películas y series', (movieShows?.content || []).map((m) => ({ key: `movie-${m.id}`, title: m.title, to: `/movieshows/${m.id}` })))
  return groups
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState<ResultGroup[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      setGroups(await searchAll(query.trim()))
    } catch {
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn-ghost !p-2 hidden sm:inline-flex"
        onClick={() => setOpen(true)}
        title="Búsqueda global (Ctrl+K)"
        aria-label="Abrir búsqueda global"
      >
        <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] bg-ink/40 backdrop-blur-md modal-sheet">
          <div role="dialog" aria-modal="true" aria-label="Búsqueda global" className="modal w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSearch} className="relative">
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
                autoFocus
                className="input !pl-11 pr-28"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar en todas las colecciones…"
                aria-label="Búsqueda global"
              />
              <button className="btn-primary !py-2 !px-3.5 absolute right-1.5 top-1/2 -translate-y-1/2" type="submit" disabled={loading}>
                Buscar
              </button>
            </form>

            {loading && <Spinner label="Buscando…" />}

            {!loading && groups !== null && groups.length === 0 && (
              <p className="text-body text-slate text-center py-8">
                Sin resultados para &ldquo;{query}&rdquo;.
              </p>
            )}

            {!loading && groups !== null && groups.length > 0 && (
              <div className="flex flex-col gap-5 mt-5">
                {groups.map((group) => (
                  <section key={group.kind} aria-label={group.kind}>
                    <h3 className="text-caption font-semibold uppercase tracking-wide text-stone mb-2">
                      {group.kind}
                    </h3>
                    <ul className="flex flex-col gap-1">
                      {group.items.map((item) => (
                        <li key={item.key}>
                          <Link
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-brand-soft transition-colors"
                          >
                            <span className="min-w-0">
                              <span className="block text-body font-medium text-ink line-clamp-1">{item.title}</span>
                              {item.subtitle && (
                                <span className="block text-caption text-graphite line-clamp-1">{item.subtitle}</span>
                              )}
                            </span>
                            <span aria-hidden="true" className="text-graphite shrink-0">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            <div className="flex justify-end border-t border-silver/60 mt-5 pt-4">
              <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
