import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBooks } from '../api/booksApi'
import { BOOK_STATES } from '../constants/books'

async function fetchStats() {
  const [all, toRead, reading, completed] = await Promise.all([
    listBooks({ page: 0, size: 1 }),
    listBooks({ page: 0, size: 1, state: 'TO_READ' }),
    listBooks({ page: 0, size: 1, state: 'READING' }),
    listBooks({ page: 0, size: 1, state: 'COMPLETED' }),
  ])
  return {
    total: all?.totalElements ?? 0,
    toRead: toRead?.totalElements ?? 0,
    reading: reading?.totalElements ?? 0,
    completed: completed?.totalElements ?? 0,
  }
}

const BOOK_ICON = (
  <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

export default function HomePage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setStats(await fetchStats())
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
    </section>
  )
}