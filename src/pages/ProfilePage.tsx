import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Breadcrumbs from '../components/Breadcrumbs'
import { usePageTitle } from '../hooks/usePageTitle'

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-silver/60 last:border-0">
      <dt className="text-body-sm text-graphite shrink-0">{label}</dt>
      <dd className="text-body text-ink font-medium text-right break-words min-w-0">
        {value || '—'}
      </dd>
    </div>
  )
}

export default function ProfilePage() {
  usePageTitle('Mi perfil')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return <Navigate to="/login" replace />

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const initial = (user.displayName || user.username || '?').slice(0, 1).toUpperCase()

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Mi perfil' }]} />
      <div className="card p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${user.username}`}
              className="w-16 h-16 rounded-full object-cover shadow-sm bg-paper shrink-0"
            />
          ) : (
            <span
              aria-hidden="true"
              className="w-16 h-16 rounded-full shrink-0 bg-gradient-to-br from-brand to-accent flex items-center justify-center font-display text-heading text-white"
            >
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-heading text-ink line-clamp-1">
              {user.displayName || user.username}
            </h1>
            <p className="text-body-sm text-graphite">@{user.username}</p>
          </div>
        </div>

        <dl>
          <Row label="Usuario" value={user.username} />
          <Row label="Email" value={user.email} />
          <Row label="Nombre a mostrar" value={user.displayName} />
          <Row label="Bio" value={user.bio} />
          <Row
            label="Miembro desde"
            value={user.createdAt ? user.createdAt.slice(0, 10) : undefined}
          />
        </dl>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-silver/60">
          <Link className="btn-ghost" to="/">
            Volver al inicio
          </Link>
          <button
            type="button"
            className="btn-ghost !text-red-600 hover:!bg-red-50 hover:!border-red-200"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
