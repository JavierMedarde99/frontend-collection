import CollectionPreferencesPanel from '../components/CollectionPreferencesPanel'
import Breadcrumbs from '../components/Breadcrumbs'
import { usePageTitle } from '../hooks/usePageTitle'

export default function PreferencesPage() {
  usePageTitle('Preferencias')

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Preferencias' }]} />
      <div>
        <h1 className="font-display text-heading-lg mb-2">Preferencias</h1>
        <p className="text-body text-slate">Configura tus colecciones.</p>
      </div>
      <CollectionPreferencesPanel />
    </div>
  )
}
