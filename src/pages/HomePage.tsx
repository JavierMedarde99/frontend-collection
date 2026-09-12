import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBooks } from '../api/booksApi'
import { listGames } from '../api/gamesApi'
import { listMagicCards } from '../api/magicApi'
import { listDecks } from '../api/deckApi'
import { listBoardGames } from '../api/boardgamesApi'
import { listMovieShows } from '../api/movieshowsApi'
import { BOOK_STATES } from '../constants/books'
import { BookState } from '../types'
import { usePageTitle } from '../hooks/usePageTitle'

interface Stats {
  total: number
  toRead: number
  reading: number
  completed: number
}

function countOf(result: PromiseSettledResult<{ totalElements?: number } | null>): number {
  return result.status === 'fulfilled' ? result.value?.totalElements ?? 0 : 0
}

async function fetchStats(): Promise<Stats> {
  // Promise.allSettled: un fallo parcial no pone el resto a cero.
  // (Una sola llamada requeriría GET /api/books/stats en el backend.)
  const [all, toRead, reading, completed] = await Promise.allSettled([
    listBooks({ page: 0, size: 1 }),
    listBooks({ page: 0, size: 1, state: BookState.TO_READ }),
    listBooks({ page: 0, size: 1, state: BookState.READING }),
    listBooks({ page: 0, size: 1, state: BookState.COMPLETED }),
  ])
  return {
    total: countOf(all),
    toRead: countOf(toRead),
    reading: countOf(reading),
    completed: countOf(completed),
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
    listDecks().catch(() => []),
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
  decks?.forEach((d) => push('Mazo', 'bg-amber-100 text-amber-800', d.name, d.createdAt, `/magic/mazos/${d.id}`, `deck-${d.id}`))
  boardGames?.content?.forEach((g) => push('Mesa', 'bg-emerald-100 text-emerald-700', g.title, g.dateAdded, `/boardgames/${g.id}`, `board-${g.id}`))
  movieShows?.content?.forEach((m) => push('Cine', 'bg-purple-100 text-purple-700', m.title, m.dateAdded, `/movieshows/${m.id}`, `movie-${m.id}`))
  return items.sort((a, b) => b.time - a.time).slice(0, 5)
}

const BOOK_ICON = (
  <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

export default function HomePage() {
  usePageTitle('Inicio')
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [fetchedStats, fetchedRecent] = await Promise.all([fetchStats(), fetchRecent()])
      setStats(fetchedStats)
      setRecent(fetchedRecent)
    } catch {
      setStats({ total: 0, toRead: 0, reading: 0, completed: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const statCards = [
    { key: 'total', label: 'Libros totales', value: stats?.total },
    { key: 'toRead', label: BOOK_STATES.TO_READ, value: stats?.toRead ?? 0 },
    { key: 'reading', label: BOOK_STATES.READING, value: stats?.reading ?? 0 },
    { key: 'completed', label: BOOK_STATES.COMPLETED, value: stats?.completed ?? 0 },
  ]

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
              Tu biblioteca personal
            </span>
            <h1 className="font-display text-heading-lg md:text-display text-white mt-4 mb-3 max-w-2xl leading-[1.08]">
              Dale vida a tu colección de libros
            </h1>
            <p className="text-subheading text-white/90 max-w-xl">
              Organiza lo que lees, busca cualquier libro en Google Books y lleva el control
              de tu progreso en un solo sitio.
            </p>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="card flex items-center gap-4 p-5">
            <span className="w-11 h-11 shrink-0 rounded-xl bg-brand-soft flex items-center justify-center text-brand">
              {BOOK_ICON}
            </span>
            <div>
              <p className="font-display text-heading text-ink leading-none">
                {loading ? (
                  <span className="skeleton h-7 w-10 inline-block align-middle" />
                ) : (
                  card.value
                )}
              </p>
              <p className="text-caption text-slate mt-1">{card.label}</p>
            </div>
          </div>
        ))}
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
