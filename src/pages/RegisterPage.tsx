import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import { usePageTitle } from '../hooks/usePageTitle'

const USERNAME_RE = /^[a-zA-Z0-9_]+$/
const STEAM_ID_RE = /^\d{17}$/

export default function RegisterPage() {
  usePageTitle('Crear cuenta')
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [steamId, setSteamId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to="/" replace />

  function validate(): string | null {
    const name = username.trim()
    if (name.length < 3 || name.length > 20) return 'El usuario debe tener entre 3 y 20 caracteres.'
    if (!USERNAME_RE.test(name)) return 'El usuario solo admite letras, números y guion bajo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'El email no tiene un formato válido.'
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
    if (steamId.trim() && !STEAM_ID_RE.test(steamId.trim())) return 'El Steam ID debe tener 17 dígitos.'
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const invalid = validate()
    if (invalid) return setError(invalid)
    setError(null)
    setSubmitting(true)
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        ...(displayName.trim() ? { displayName: displayName.trim() } : {}),
        ...(steamId.trim() ? { steamId: steamId.trim() } : {}),
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-8">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Crear cuenta' }]} />
      <div className="card p-6 md:p-8 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-heading-lg mb-2">Crear cuenta</h1>
          <p className="text-body text-slate">Guarda tu colección en tu cuenta.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="register-username">
              Usuario <span className="text-brand">*</span>
            </label>
            <input
              id="register-username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3–20 caracteres, letras, números y _"
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="register-email">
              Email <span className="text-brand">*</span>
            </label>
            <input
              id="register-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="register-password">
              Contraseña <span className="text-brand">*</span>
            </label>
            <input
              id="register-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="register-display">
              Nombre a mostrar
            </label>
            <input
              id="register-display"
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Opcional"
              autoComplete="nickname"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="register-steam">
              Steam ID
            </label>
            <input
              id="register-steam"
              className="input"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              placeholder="17 dígitos, opcional"
              inputMode="numeric"
              maxLength={17}
            />
          </div>
          {error && <ErrorBanner message={error} />}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>
        <p className="text-body-sm text-slate text-center">
          ¿Ya tienes cuenta?{' '}
          <Link className="text-brand font-semibold hover:underline" to="/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
