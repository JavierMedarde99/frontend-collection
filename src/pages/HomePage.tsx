import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGlobalStats } from '../api/statsApi'
import { listBooks } from '../api/booksApi'
import { listGames } from '../api/gamesApi'
import { listMagicCards } from '../api/magicApi'
import { listDecks } from '../api/deckApi'
import { listBoardGames } from '../api/boardgamesApi'
import { listMovieShows } from '../api/movieshowsApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'

interface EntityTotals {
  books: number
  games: number
  magic: number
  decks: number
  boardGames: number
  movieShows: number
}

const ENTITIES: { key: keyof EntityTotals; label: string; short: string; to: string; chip: string }[] = [
  { key: 'books', label: 'Libros', short: 'L', to: '/coleccion', chip: 'bg-indigo-100 text-indigo-700' },
  { key: 'games', label: 'Videojuegos', short: 'V', to: '/juegos', chip: 'bg-sky-100 text-sky-700' },
  { key: 'magic', label: 'Cartas Magic', short: 'M', to: '/magic', chip: 'bg-rose-100 text-rose-700' },
  { key: 'decks', label: 'Mazos', short: 'Z', to: '/magic/mazos', chip: 'bg-amber-100 text-amber-800' },
  { key: 'boardGames', label: 'Juegos de mesa', short: 'J', to: '/boardgames', chip: 'bg-emerald-100 text-emerald-700' },
  { key: 'movieShows', label: 'Películas y series', short: 'C', to: '/movieshows', chip: 'bg-purple-100 text-purple-700' },
]

const ZERO_TOTALS: EntityTotals = { books: 0, games: 0, magic: 0, decks: 0, boardGames: 0, movieShows: 0 }

async function fetchEntityTotals(): Promise<EntityTotals> {
  try {
    const { collections } = await getGlobalStats()
    const get = (key: string): number => collections?.[key] ?? 0
    return {
      books: get('books'),
      games: get('games'),
      magic: get('magic'),
      decks: get('decks'),
      boardGames: get('boardgames'),
      movieShows: get('movieshows'),
    }
  } catch {
    return { ...ZERO_TOTALS }
  }
}

interface RecentItem {
  key: string
  kind: string
  kindColor: string
  title: string
  date: string
  to: string
}

function toTime(value?: string): number | null {
  if (!value) return null
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : time
}

async function fetchRecent(): Promise<RecentItem[]> {
  const [books, games, magic, decks, boardGames, movieShows] = await Promise.all([
    listBooks({ page: 0, size: 5 }).catch(() => null),
    listGames({ page: 0, size: 5 }).catch(() => null),
    listMagicCards({ page: 0, size: 5 }).catch(() => null),
    listDecks({ page: 0, size: 5 }).catch(() => null),
    listBoardGames({ page: 0, size: 5 }).catch(() => null),
    listMovieShows({ page: 0, size: 5 }).catch(() => null),
  ])
  const items: (RecentItem & { time: number })[] = []
  const push = (kind: string, kindColor: string, title: string, date: string | undefined, to: string, key: string) => {
    const time = toTime(date)
    if (time !== null) items.push({ key, kind, kindColor, title, date, to, time })
  }
  books?.content?.forEach((b) => push('Libro', 'bg-indigo-100 text-indigo-700', b.title, b.startDate, `/coleccion/${b.id}`, `book-${b.id}`))
  games?.content?.forEach((g) => push('Videojuego', 'bg-sky-100 text-sky-700', g.title, g.dateAdded, `/juegos/${g.id}`, `game-${g.id}`))
  magic?.content?.forEach((c) => push('Magic', 'bg-rose-100 text-rose-700', c.name, c.dateAdded, `/magic/${c.id}`, `magic-${c.id}`))
  decks?.content?.forEach((d) => push('Mazo', 'bg-amber-100 text-amber-800', d.name, d.createdAt, `/magic/mazos/${d.id}`, `deck-${d.id}`))
  boardGames?.content?.forEach((g) => push('Mesa', 'bg-emerald-100 text-emerald-700', g.title, g.dateAdded, `/boardgames/${g.id}`, `board-${g.id}`))
  movieShows?.content?.forEach((m) => push('Cine', 'bg-purple-100 text-purple-700', m.title, m.dateAdded, `/movieshows/${m.id}`, `movie-${m.id}`))
  return items.sort((a, b) => b.time - a.time).slice(0, 5)
}

export default function HomePage() {
  usePageTitle('Inicio')
  const { isAuthenticated, activeCollections } = useAuth()
  const [entities, setEntities] = useState<EntityTotals | null>(null)
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [fetchedEntities, fetchedRecent] = await Promise.all([
        fetchEntityTotals(),
        fetchRecent(),
      ])
      setEntities(fetchedEntities)
      setRecent(fetchedRecent)
    } catch {
      setEntities({ ...ZERO_TOTALS })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visibleEntities = !isAuthenticated
    ? ENTITIES
    : ENTITIES.filter((entity) => activeCollections.includes(entity.key.toUpperCase()))

  return (
    <section className="flex flex-col gap-8 animate-fade-up">
      <div className="relative overflow-hidden rounded-3xl bg-hero-gradient shadow-card-hover">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-6 p-8 md:p-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-3.5 py-1.5 text-caption font-semibold text-white">
              <svg aria-hidden="true" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Tu biblioteca personal y más
            </span>
            <h1 className="font-display text-heading-lg md:text-display text-white mt-4 mb-3 max-w-2xl leading-[1.08]">
              Todas tus colecciones, por fin en orden
            </h1>
            <p className="text-subheading text-white/90 max-w-xl">
              Libros, videojuegos, cartas Magic, mazos, juegos de mesa, películas y
              series: guarda todo lo que coleccionas, encuéntralo al instante y
              presume de ello.
            </p>
            {!loading && entities && (
              <p className="text-body text-white/90">
                <strong className="font-display text-heading">
                  {visibleEntities.reduce((sum, e) => sum + entities[e.key], 0)}
                </strong>{' '}
                elementos guardados en {visibleEntities.length} colecciones
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/coleccion"
              className="btn-primary !bg-white !from-white !to-white !text-brand !shadow-none hover:!from-brand-soft hover:!to-brand-soft"
            >
              Ver mi colección
            </Link>
            <Link
              to="/nuevo"
              className="inline-flex items-center justify-center px-6 py-3 rounded-pill bg-white/15 backdrop-blur text-white font-display font-semibold text-sm border border-white/25 transition-all duration-200 hover:bg-white/25 active:scale-[0.98]"
            >
              Añadir libro
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-heading text-ink">Tu colección en cifras</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleEntities.map((entity) => (
            <Link key={entity.key} to={entity.to} className="card card-hover flex items-center gap-4 p-5">
              <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center font-display font-bold text-heading-sm ${entity.chip}`} aria-hidden="true">
                {entity.short}
              </span>
              <div className="min-w-0">
                <p className="font-display text-heading text-ink leading-none">
                  {loading || entities === null ? (
                    <span className="skeleton h-7 w-10 inline-block align-middle" />
                  ) : (
                    entities[entity.key]
                  )}
                </p>
                <p className="text-caption text-slate mt-1 line-clamp-1">{entity.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {!loading && recent.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-heading text-ink">Añadido recientemente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recent.map((item) => (
              <Link key={item.key} to={item.to} className="card card-hover flex items-center gap-4 p-4">
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-caption font-semibold ${item.kindColor}`}>
                  {item.kind}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-heading-sm text-ink line-clamp-1">{item.title}</span>
                  <span className="block text-caption text-graphite mt-0.5">{item.date.slice(0, 10)}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
