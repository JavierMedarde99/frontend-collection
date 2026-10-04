import { useParams } from 'react-router-dom'
import ProfileView from '../components/ProfileView'
import Breadcrumbs from '../components/Breadcrumbs'

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  return (
    <section className="max-w-4xl mx-auto flex flex-col gap-12">
      <Breadcrumbs items={[{ label: "Inicio", to: "/" }, { label: username ? `@${username}` : 'Perfil' }]} />
      <div className="rule-double">
        <span className="accent-bar" />
      </div>
      <ProfileView username={username} />
    </section>
  )
}