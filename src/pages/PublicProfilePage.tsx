import { useParams } from 'react-router-dom'
import ProfileView from '../components/ProfileView'

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  return <ProfileView username={username} />
}
