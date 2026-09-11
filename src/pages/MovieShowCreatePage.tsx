import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMovieShow } from '../api/movieshowsApi'
import type { MovieShowFormData } from '../types'
import MovieShowForm from '../components/MovieShowForm'
import MovieShowSearch from '../components/MovieShowSearch'

type Mode = 'search' | 'manual'

const MODES: { key: Mode; label: string }[] = [
  { key: 'search', label: 'Buscar en TMDB' },
  { key: 'manual', label: 'Alta manual' },
]

export default function MovieShowCreatePage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('search')

  async function handleSubmit(payload: MovieShowFormData) {
    await createMovieShow(payload)
    navigate('/movieshows', { replace: true })
  }

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <div>
        <h1 className="font-display text-heading-lg mb-2">Añadir película/serie</h1>
        <p className="text-body text-slate">
          Añade una película o serie a tu colección buscándola o introduciendo sus datos manualmente.
        </p>
      </div>

      <div role="tablist" className="flex items-center gap-1 p-1 rounded-pill bg-white border border-silver w-fit" aria-label="Método de alta">
        {MODES.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mode === m.key}
            className={`rounded-pill px-4 py-2 text-sm font-semibold transition-all duration-200 ease-smooth ${
              mode === m.key
                ? 'bg-brand text-white shadow-brand-glow'
                : 'text-graphite hover:text-ink'
            }`}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'search' ? (
        <MovieShowSearch />
      ) : (
        <MovieShowForm submitLabel="Guardar película/serie" onSubmit={handleSubmit} />
      )}
    </section>
  )
}
