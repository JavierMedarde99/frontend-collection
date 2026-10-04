import CollectionPreferencesPanel from '../components/CollectionPreferencesPanel'
import CreateShell from '../components/CreateShell'
import { usePageTitle } from '../hooks/usePageTitle'

export default function PreferencesPage() {
  usePageTitle('Preferencias')

  return (
    <section className="max-w-2xl mx-auto flex flex-col gap-12">
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Preferencias" }]}
        eyebrow="Preferencias"
        title="Preferencias"
        subtitle="Configura tus colecciones."
      >
        <CollectionPreferencesPanel />
      </CreateShell>
    </section>
  )
}