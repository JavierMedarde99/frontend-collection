import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMovieShow } from '../api/movieshowsApi'
import type { MovieShowFormData } from '../types'
import MovieShowForm from '../components/MovieShowForm'
import MovieShowSearch from '../components/MovieShowSearch'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

type Mode = 'search' | 'manual'

const MODES: { value: Mode; label: string }[] = [
  { value: 'search', label: 'Buscar en TMDB' },
  { value: 'manual', label: 'Alta manual' },
]

export default function MovieShowCreatePage() {
  usePageTitle('Añadir película/serie')
  const navigate = useNavigate()
  const notify = useToast()
  const [mode, setMode] = useState<Mode>('search')

  async function handleSubmit(payload: MovieShowFormData) {
    await createMovieShow(payload)
    notify('Película/serie guardada.')
    navigate('/movieshows', { replace: true })
  }

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.movieshows.accent.spine, '--c': COLLECTIONS_BY_KEY.movieshows.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Películas y series", to: "/movieshows" }, { label: "Añadir" }]}
        eyebrow="Películas y series"
        title="Añadir película/serie"
        subtitle="Añade una película o serie a tu colección buscándola en TMDB o introduciendo sus datos manualmente."
        tabs={MODES}
        activeTab={mode}
        onTabChange={(v) => setMode(v as Mode)}
      >
        {mode === 'search' ? (
          <MovieShowSearch />
        ) : (
          <MovieShowForm isCreate submitLabel="Guardar película/serie" onSubmit={handleSubmit} />
        )}
      </CreateShell>
    </section>
  )
}