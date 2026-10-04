import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBoardGame } from '../api/boardgamesApi'
import type { BoardGameFormData } from '../types'
import BoardGameForm from '../components/BoardGameForm'
import BoardGameSearch from '../components/BoardGameSearch'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

type Mode = 'search' | 'manual'

const MODES: { value: Mode; label: string }[] = [
  { value: 'search', label: 'Buscar juego' },
  { value: 'manual', label: 'Alta manual' },
]

export default function BoardGameCreatePage() {
  usePageTitle('Añadir juego de mesa')
  const navigate = useNavigate()
  const notify = useToast()
  const [mode, setMode] = useState<Mode>('search')

  async function handleSubmit(payload: BoardGameFormData) {
    await createBoardGame(payload)
    notify('Juego de mesa guardado.')
    navigate('/boardgames', { replace: true })
  }

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.boardgames.accent.spine, '--c': COLLECTIONS_BY_KEY.boardgames.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Juegos de mesa", to: "/boardgames" }, { label: "Añadir" }]}
        eyebrow="Juegos de mesa"
        title="Añadir juego de mesa"
        subtitle="Añade un juego de mesa a tu colección buscándolo en BoardGameGeek o introduciendo sus datos manualmente."
        tabs={MODES}
        activeTab={mode}
        onTabChange={(v) => setMode(v as Mode)}
      >
        {mode === 'search' ? (
          <BoardGameSearch />
        ) : (
          <BoardGameForm isCreate submitLabel="Guardar juego" onSubmit={handleSubmit} />
        )}
      </CreateShell>
    </section>
  )
}