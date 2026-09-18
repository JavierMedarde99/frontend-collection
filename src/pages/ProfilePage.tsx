import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileView from '../components/ProfileView'

/** Mi perfil: misma vista que el perfil público, con mis datos. */
export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return <ProfileView username={user.username} />
}
