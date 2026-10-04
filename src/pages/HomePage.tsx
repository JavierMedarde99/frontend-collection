import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getGlobalStats } from '../api/statsApi'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import { COLLECTIONS_BY_KEY, type CollectionKey } from '../constants/collections'

interface EntityTotals {
  books: number
  games: number
  magic: number
  decks: number
  boardGames: number
  movieShows: number
}

const ENTITIES: { key: keyof EntityTotals; label: string; to: string }[] = [
  { key: 'books', label: 'Libros', to: '/coleccion' },
  { key: 'games', label: 'Videojuegos', to: '/juegos' },
  { key: 'magic', label: 'Cartas Magic', to: '/magic' },
  { key: 'decks', label: 'Mazos', to: '/magic/mazos' },
  { key: 'boardGames', label: 'Juegos de mesa', to: '/boardgames' },
  { key: 'movieShows', label: 'Películas y series', to: '/movieshows' },
]

/** Clave interna de HomePage (camelCase) → clave de COLLECTIONS (minúscula). */
const KEY: Record<keyof EntityTotals, CollectionKey> = {
  books: 'books',
  games: 'games',
  magic: 'magic',
  decks: 'decks',
  boardGames: 'boardgames',
  movieShows: 'movieshows',
}

/** Pieza dibujada de cada colección, tal y como se aprobó en el mockup. */
const NICHE_ICONS: Record<keyof EntityTotals, ReactNode> = {
  books: (
    <>
      <path d="M24 11v26" />
      <path d="M24 12C21 8.6 15.5 8.6 7 9.8v26.2c8.5-1.2 14-1.2 17 2.2 3-3.4 8.5-3.4 17-2.2V9.8C32.5 8.6 27 8.6 24 12z" />
    </>
  ),
  games: (
    <>
      <rect x="7" y="17" width="34" height="16" rx="8" />
      <path d="M15 20.5v9M10.5 25h9" />
      <circle cx="33" cy="21.6" r="1.5" />
      <circle cx="37.2" cy="25.8" r="1.5" />
    </>
  ),
  magic: (
    <>
      <rect x="14" y="7" width="20" height="34" rx="3" />
      <rect x="18.5" y="11.5" width="11" height="8" rx="1.5" />
      <ellipse cx="24" cy="26" rx="4.4" ry="5.6" />
      <circle cx="24" cy="35" r="1.8" />
    </>
  ),
  decks: (
    <>
      <rect x="15" y="9" width="24" height="32" rx="2.5" />
      <rect x="19.5" y="11.5" width="24" height="32" rx="2.5" opacity=".8" />
      <rect x="24" y="14" width="24" height="32" rx="2.5" opacity=".55" />
    </>
  ),
  boardGames: (
    <>
      <rect x="13" y="14" width="22" height="22" rx="5" />
      <circle cx="18.4" cy="19.4" r="1.7" />
      <circle cx="29.6" cy="19.4" r="1.7" />
      <circle cx="24" cy="27" r="1.7" />
      <circle cx="18.4" cy="34.6" r="1.7" />
      <circle cx="29.6" cy="34.6" r="1.7" />
    </>
  ),
  movieShows: (
    <>
      <rect x="8" y="13" width="32" height="22" rx="2" />
      <rect x="16" y="17" width="6.5" height="14" rx="1" />
      <rect x="26" y="17" width="6.5" height="14" rx="1" />
      <path d="M10.6 16h2M14.4 16h.5M32 16h.5M35.4 16h2M10.6 32h2M14.4 32h.5M32 32h.5M35.4 32h2" />
    </>
  ),
}

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

/** Anima un número de 0 a target respetando prefers-reduced-motion. */
function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setValue(target)
      return
    }
    const raf = (cb: FrameRequestCallback): number =>
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame(cb)
        : window.setTimeout(() => cb(performance.now()), 16)
    const caf = (id: number): void =>
      typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(id) : window.clearTimeout(id)

    let frame = 0
    let start: number | null = null
    const step = (now: number) => {
      if (start === null) start = now
      const p = Math.min((now - start) / durationMs, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = raf(step)
    }
    frame = raf(step)
    return () => caf(frame)
  }, [target, durationMs])

  return value
}

function AnimatedCount({ value }: { value: number }) {
  const count = useCountUp(value)
  return <>{count}</>
}

export default function HomePage() {
  usePageTitle('Inicio')
  const { isAuthenticated, activeCollections } = useAuth()
  const [entities, setEntities] = useState<EntityTotals | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const fetchedEntities = await fetchEntityTotals()
      setEntities(fetchedEntities)
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

  const total = entities ? visibleEntities.reduce((sum, e) => sum + entities[e.key], 0) : 0
  const piezaWord = total === 1 ? 'pieza' : 'piezas'
  const cta = isAuthenticated
    ? { to: '/nuevo', label: 'Añadir a mi colección' }
    : { to: '/register', label: 'Registrarse y empezar' }

  return (
    <section className="relative flex flex-col gap-9 animate-fade-up">
      <div className="paper-grain" aria-hidden="true" />

      {/* Hero */}
      <div className="grid items-end gap-10 pt-2 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <span className="eyebrow">Tu gabinete de curiosidades</span>
          <h1 className="font-display font-semibold text-[clamp(36px,5.2vw,58px)] leading-[1.04] tracking-[-0.8px] text-ink mt-4 mb-3 max-w-2xl">
            Todas tus colecciones, <em className="italic text-brand font-medium">por fin</em> en orden
          </h1>
          <p className="text-subheading text-graphite max-w-[46ch]">
            Libros, videojuegos, cartas Magic, mazos, juegos de mesa, películas y series: cada pieza
            tiene su vitrina. Guárdalo todo y encuéntralo al instante.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-7">
            <Link to={cta.to} className="btn-primary">
              {cta.label}
            </Link>
            {!loading && entities && (
              <p className="text-body-sm text-slate italic flex items-center gap-2">
                <strong className="font-display font-semibold text-ink not-italic">{total}</strong>{' '}
                elementos guardados ·{' '}
                <strong className="font-display font-semibold text-ink not-italic">
                  {visibleEntities.length}
                </strong>{' '}
                colecciones
              </p>
            )}
          </div>
        </div>

        {/* Gabinete de curiosidades: una pieza por colección */}
        <div
          className="vitrina"
          role="img"
          aria-label="Vitrina de curiosidades con una pieza por cada colección"
        >
          <p className="vitrina-plaque">El Gabinete · Colecciones</p>
          <div className="vitrina-niches">
            {visibleEntities.map((entity) => (
              <div
                key={entity.key}
                className="vitrina-niche"
                style={{ '--c': COLLECTIONS_BY_KEY[KEY[entity.key]].accent.niche } as CSSProperties}
              >
                <svg
                  className="vitrina-niche-obj"
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {NICHE_ICONS[entity.key]}
                </svg>
                <span className="vitrina-niche-label">{COLLECTIONS_BY_KEY[KEY[entity.key]].nick}</span>
              </div>
            ))}
          </div>
          <p className="vitrina-foot">
            {visibleEntities.length} {visibleEntities.length === 1 ? 'vitrina' : 'vitrinas'} · {total}{' '}
            {piezaWord}
          </p>
        </div>
      </div>

      {/* Nota al margen */}
      <div className="margin-note rule-double">
        <span className="font-display font-semibold text-[15px] text-[#b3862d]">✳</span>
        <blockquote className="font-display italic text-subheading text-graphite max-w-[56ch]">
          Un coleccionista no guarda cosas:{' '}
          <strong className="text-ink font-semibold not-italic">cuenta las historias</strong> que le
          acompañan. Este es tu gabinete de curiosidades.
        </blockquote>
      </div>

      {/* Cifras como lomos de catálogo */}
      <div className="flex flex-col gap-1">
        <div className="section-head">
          <h2 className="font-display text-heading text-ink">Tu colección en cifras</h2>
          <span className="font-display italic text-sm text-slate">catálogo nº 01 · otoño 2026</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {visibleEntities.map((entity) => (
            <Link
              key={entity.key}
              to={entity.to}
              className="spine-card"
              style={{ '--sc': COLLECTIONS_BY_KEY[KEY[entity.key]].accent.spine } as CSSProperties}
            >
              <span className="count">
                {loading || entities === null ? (
                  <span className="skeleton h-8 w-10 inline-block" />
                ) : (
                  <AnimatedCount value={entities[entity.key]} />
                )}
                <sup>unidades</sup>
              </span>
              <p className="spine-label">{entity.label}</p>
              <span className="rule-line" />
              <span className="to">Consultar</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}