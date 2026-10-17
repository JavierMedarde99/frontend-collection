import { useRef, useState, type FormEvent, type RefObject } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import FieldError from '../components/FieldError'
import Breadcrumbs from '../components/Breadcrumbs'
import PasswordInput from '../components/PasswordInput'
import { usePageTitle } from '../hooks/usePageTitle'

const USERNAME_RE = /^[a-zA-Z0-9_]+$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STEAM_ID_RE = /^\d{17}$/

type FieldKey = 'username' | 'email' | 'password' | 'steamId'
type FieldErrors = Partial<Record<FieldKey, string>>

function validateField(key: FieldKey, value: string): string | undefined {
  const v = value.trim()
  switch (key) {
    case 'username':
      if (v.length < 3 || v.length > 20) return 'El usuario debe tener entre 3 y 20 caracteres.'
      if (!USERNAME_RE.test(v)) return 'El usuario solo admite letras, números y guion bajo.'
      return undefined
    case 'email':
      return EMAIL_RE.test(v) ? undefined : 'El email no tiene un formato válido.'
    case 'password':
      return v.length < 8 ? 'La contraseña debe tener al menos 8 caracteres.' : undefined
    case 'steamId':
      return v && !STEAM_ID_RE.test(v) ? 'El Steam ID debe tener 17 dígitos.' : undefined
    default:
      return undefined
  }
}

export default function RegisterPage() {
  usePageTitle('Crear cuenta')
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [steamId, setSteamId] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fieldRefs: Record<FieldKey, RefObject<HTMLInputElement | null>> = {
    username: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    steamId: useRef<HTMLInputElement>(null),
  }

  if (user) return <Navigate to="/" replace />

  const values: Record<FieldKey, string> = { username, email, password, steamId }
  const order: FieldKey[] = ['username', 'email', 'password', 'steamId']

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next: FieldErrors = {}
    for (const key of order) {
      const message = validateField(key, values[key])
      if (message) next[key] = message
    }
    setErrors(next)
    const firstInvalid = order.find((key) => next[key])
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus()
      return
    }
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
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="register-username">
              Usuario <span className="text-brand">*</span>
            </label>
            <input
              id="register-username"
              ref={fieldRefs.username}
              className="input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) setErrors((prev) => ({ ...prev, username: validateField('username', e.target.value) }))
              }}
              placeholder="3–20 caracteres, letras, números y _"
              autoComplete="username"
              required
              aria-invalid={errors.username ? true : undefined}
              aria-describedby={errors.username ? 'register-username-error' : undefined}
            />
            <FieldError id="register-username-error" message={errors.username} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="register-email">
              Email <span className="text-brand">*</span>
            </label>
            <input
              id="register-email"
              ref={fieldRefs.email}
              className="input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }))
              }}
              placeholder="tu@email.com"
              autoComplete="email"
              required
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
            />
            <FieldError id="register-email-error" message={errors.email} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="register-password">
              Contraseña <span className="text-brand">*</span>
            </label>
            <PasswordInput
              id="register-password"
              ref={fieldRefs.password}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: validateField('password', e.target.value) }))
              }}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
            />
            <FieldError id="register-password-error" message={errors.password} />
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
              ref={fieldRefs.steamId}
              className="input"
              value={steamId}
              onChange={(e) => {
                setSteamId(e.target.value)
                if (errors.steamId) setErrors((prev) => ({ ...prev, steamId: validateField('steamId', e.target.value) }))
              }}
              placeholder="17 dígitos, opcional"
              inputMode="numeric"
              maxLength={17}
              aria-invalid={errors.steamId ? true : undefined}
              aria-describedby={errors.steamId ? 'register-steam-error' : undefined}
            />
            <FieldError id="register-steam-error" message={errors.steamId} />
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
