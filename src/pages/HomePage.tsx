import { useCallback, useEffect, useState, type ReactNode } from 'react'
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

const ENTITIES: { key: keyof EntityTotals; label: string; icon: ReactNode; to: string; chip: string }[] = [
  {
    key: 'books',
    label: 'Libros',
    icon: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
    to: '/coleccion',
    chip: 'bg-indigo-100 text-indigo-700',
  },
  {
    key: 'games',
    label: 'Videojuegos',
    icon: (
      <>
        <rect x="2.5" y="7.5" width="19" height="10" rx="5" />
        <path d="M8 10.5v4M6 12.5h4" />
        <path d="M15.5 11.5h.01M17.5 13.5h.01" />
      </>
    ),
    to: '/juegos',
    chip: 'bg-sky-100 text-sky-700',
  },
  {
    key: 'magic',
    label: 'Cartas Magic',
    icon: (
      <>
        <rect x="6.5" y="3" width="11" height="18" rx="2.5" />
        <path d="M12 16.5s-3.2-2.1-3.2-4.4c0-1.3 1-2.2 2.1-2.2.5 0 .9.2 1.1.6.2-.4.6-.6 1.1-.6 1.1 0 2.1.9 2.1 2.2 0 2.3-3.2 4.4-3.2 4.4z" />
      </>
    ),
    to: '/magic',
    chip: 'bg-rose-100 text-rose-700',
  },
  {
    key: 'decks',
    label: 'Mazos',
    icon: <path d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />,
    to: '/magic/mazos',
    chip: 'bg-amber-100 text-amber-800',
  },
  {
    key: 'boardGames',
    label: 'Juegos de mesa',
    icon: <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
    to: '/boardgames',
    chip: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'movieShows',
    label: 'Películas y series',
    icon: (
      <>
        <rect x="3" y="8.5" width="18" height="12" rx="2" />
        <path d="M3.5 8.5L5.5 4.5h13L16.5 8.5M8.5 4.5l2.5 4M14 4.5l2.5 4M7.5 12.5h.01M11 12.5h.01M14.5 16h5" />
      </>
    ),
    to: '/movieshows',
    chip: 'bg-purple-100 text-purple-700',
  },
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
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-heading text-ink">Tu colección en cifras</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleEntities.map((entity) => (
            <Link key={entity.key} to={entity.to} className="card card-hover flex items-center gap-4 p-5">
              <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${entity.chip}`} aria-hidden="true">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  {entity.icon}
                </svg>
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
