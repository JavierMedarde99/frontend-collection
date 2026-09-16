import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import { usePageTitle } from '../hooks/usePageTitle'

export default function LoginPage() {
  usePageTitle('Iniciar sesión')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim()) return setError('El nombre de usuario es obligatorio.')
    if (!password) return setError('La contraseña es obligatoria.')
    setError(null)
    setSubmitting(true)
    try {
      await login({ username: username.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-8">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Iniciar sesión' }]} />
      <div className="card p-6 md:p-8 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Iniciar sesión</h1>
          <p className="text-body text-slate">Accede a tu colección.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="login-username">
              Usuario <span className="text-brand">*</span>
            </label>
            <input
              id="login-username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="login-password">
              Contraseña <span className="text-brand">*</span>
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <ErrorBanner message={error} />}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className="text-body-sm text-slate text-center">
          ¿No tienes cuenta?{' '}
          <Link className="text-brand font-semibold hover:underline" to="/register">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
