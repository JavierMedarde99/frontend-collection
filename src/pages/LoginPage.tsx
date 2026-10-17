import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import FieldError from '../components/FieldError'
import Breadcrumbs from '../components/Breadcrumbs'
import PasswordInput from '../components/PasswordInput'
import { usePageTitle } from '../hooks/usePageTitle'

export default function LoginPage() {
  usePageTitle('Iniciar sesión')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: { username?: string; password?: string } = {}
    if (!username.trim()) next.username = 'El nombre de usuario es obligatorio.'
    if (!password) next.password = 'La contraseña es obligatoria.'
    setErrors(next)
    if (next.username) {
      usernameRef.current?.focus()
      return
    }
    if (next.password) {
      passwordRef.current?.focus()
      return
    }
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
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="login-username">
              Usuario <span className="text-brand">*</span>
            </label>
            <input
              id="login-username"
              ref={usernameRef}
              className="input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }))
              }}
              placeholder="Tu nombre de usuario"
              autoComplete="username"
              required
              aria-invalid={errors.username ? true : undefined}
              aria-describedby={errors.username ? 'login-username-error' : undefined}
            />
            <FieldError id="login-username-error" message={errors.username} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="login-password">
              Contraseña <span className="text-brand">*</span>
            </label>
            <PasswordInput
              id="login-password"
              ref={passwordRef}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            <FieldError id="login-password-error" message={errors.password} />
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
