import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGame } from '../api/gamesApi'
import type { GameFormData } from '../types'
import GameForm from '../components/GameForm'
import GameSearch from '../components/GameSearch'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

type Mode = 'search' | 'manual'

const MODES: { value: Mode; label: string }[] = [
  { value: 'search', label: 'Buscar videojuego' },
  { value: 'manual', label: 'Alta manual' },
]

export default function GameCreatePage() {
  usePageTitle('Añadir videojuego')
  const navigate = useNavigate()
  const notify = useToast()
  const [mode, setMode] = useState<Mode>('manual')

  async function handleSubmit(payload: GameFormData) {
    await createGame(payload)
    notify('Videojuego guardado.')
    navigate('/juegos', { replace: true })
  }

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.games.accent.spine, '--c': COLLECTIONS_BY_KEY.games.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Videojuegos", to: "/juegos" }, { label: "Añadir" }]}
        eyebrow="Videojuegos"
        title="Añadir videojuego"
        subtitle="Añade un videojuego a tu colección buscándolo o introduciendo sus datos manualmente."
        tabs={MODES}
        activeTab={mode}
        onTabChange={(v) => setMode(v as Mode)}
      >
        {mode === 'search' ? (
          <GameSearch />
        ) : (
          <GameForm isCreate submitLabel="Guardar videojuego" onSubmit={handleSubmit} />
        )}
      </CreateShell>
    </section>
  )
}