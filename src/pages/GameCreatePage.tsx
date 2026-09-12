import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGame } from '../api/gamesApi'
import type { GameFormData } from '../types'
import GameForm from '../components/GameForm'
import GameSearch from '../components/GameSearch'
import Breadcrumbs from '../components/Breadcrumbs'

type Mode = 'search' | 'manual'

const MODES: { key: Mode; label: string }[] = [
  { key: 'search', label: 'Buscar videojuego' },
  { key: 'manual', label: 'Alta manual' },
]

export default function GameCreatePage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('manual')

  async function handleSubmit(payload: GameFormData) {
    await createGame(payload)
    navigate('/juegos', { replace: true })
  }

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: "Videojuegos", to: "/juegos" }, { label: "Añadir" }]} />
      <div>
        <h1 className="font-display text-heading-lg mb-2">Añadir videojuego</h1>
        <p className="text-body text-slate">
          Añade un videojuego a tu colección buscándolo o introduciendo sus datos manualmente.
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
        <GameSearch />
      ) : (
        <GameForm isCreate submitLabel="Guardar videojuego" onSubmit={handleSubmit} />
      )}
    </section>
  )
}