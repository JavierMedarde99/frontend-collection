import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAmiibo } from '../api/amiibosApi'
import type { AmiiboFormData } from '../types'
import AmiiboForm from '../components/AmiiboForm'
import AmiiboSearch from '../components/AmiiboSearch'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

type Mode = 'search' | 'manual'

const MODES: { value: Mode; label: string }[] = [
  { value: 'search', label: 'Buscar Amiibo' },
  { value: 'manual', label: 'Alta manual' },
]

export default function AmiiboCreatePage() {
  usePageTitle('Añadir Amiibo')
  const navigate = useNavigate()
  const notify = useToast()
  const [mode, setMode] = useState<Mode>('search')

  async function handleSubmit(payload: AmiiboFormData) {
    await createAmiibo(payload)
    notify('Amiibo guardado.')
    navigate('/figuras/amiibo', { replace: true })
  }

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.amiibos.accent.spine, '--c': COLLECTIONS_BY_KEY.amiibos.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Figuras", to: "/figuras" }, { label: "Amiibo", to: "/figuras/amiibo" }, { label: "Añadir" }]}
        eyebrow="Amiibo"
        title="Añadir Amiibo"
        subtitle="Añade un Amiibo a tu colección buscándolo en el catálogo o introduciendo sus datos manualmente."
        tabs={MODES}
        activeTab={mode}
        onTabChange={(v) => setMode(v as Mode)}
      >
        {mode === 'search' ? (
          <AmiiboSearch />
        ) : (
          <AmiiboForm isCreate submitLabel="Guardar Amiibo" onSubmit={handleSubmit} />
        )}
      </CreateShell>
    </section>
  )
}
