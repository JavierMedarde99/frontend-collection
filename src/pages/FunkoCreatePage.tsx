import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { createFunko } from '../api/funkosApi'
import type { FunkoFormData } from '../types'
import FunkoForm from '../components/FunkoForm'
import FunkoSearch from '../components/FunkoSearch'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

type Mode = 'search' | 'manual'

const MODES: { value: Mode; label: string }[] = [
  { value: 'search', label: 'Buscar Funko' },
  { value: 'manual', label: 'Alta manual' },
]

export default function FunkoCreatePage() {
  usePageTitle('Añadir Funko Pop')
  const navigate = useNavigate()
  const notify = useToast()
  const [mode, setMode] = useState<Mode>('search')

  async function handleSubmit(payload: FunkoFormData) {
    await createFunko(payload)
    notify('Funko Pop guardado.')
    navigate('/figuras/funkopop', { replace: true })
  }

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.funkos.accent.spine, '--c': COLLECTIONS_BY_KEY.funkos.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Figuras", to: "/figuras" }, { label: "Funko Pop", to: "/figuras/funkopop" }, { label: "Añadir" }]}
        eyebrow="Funko Pop"
        title="Añadir Funko Pop"
        subtitle="Añade un Funko Pop a tu colección buscándolo en el catálogo o introduciendo sus datos manualmente."
        tabs={MODES}
        activeTab={mode}
        onTabChange={(v) => setMode(v as Mode)}
      >
        {mode === 'search' ? (
          <FunkoSearch />
        ) : (
          <FunkoForm isCreate submitLabel="Guardar Funko" onSubmit={handleSubmit} />
        )}
      </CreateShell>
    </section>
  )
}
