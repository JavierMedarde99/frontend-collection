import { useEffect, useState, type CSSProperties } from 'react'
import { useAuth } from '../context/AuthContext'
import { setActiveCollections, setCollectionVisibility } from '../api/preferencesApi'
import { COLLECTIONS, COLLECTIONS_BY_KEY } from '../constants/collections'
import type { CollectionVisibility } from '../types'

function defaults<T>(value: T, fallback: T): T {
  return value ?? fallback
}

/** Toggles de activas + visibilidad por colección, con guardado al backend. */
export default function CollectionPreferencesPanel() {
  const { user, preferences, refreshPreferences } = useAuth()
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [visibility, setVisibility] = useState<Record<string, CollectionVisibility>>({})
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const nextActive: Record<string, boolean> = {}
    const nextVisibility: Record<string, CollectionVisibility> = {}
    for (const { key } of COLLECTIONS) {
      nextActive[key] = defaults(preferences?.activeCollections?.[key], true)
      nextVisibility[key] = defaults(preferences?.collectionVisibility?.[key], 'PUBLIC')
    }
    setActive(nextActive)
    setVisibility(nextVisibility)
  }, [preferences])

  async function handleSave() {
    if (!user?.id) {
      setFeedback({ kind: 'error', text: 'Necesitas iniciar sesión.' })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      await Promise.all([
        setActiveCollections(user.id, active),
        setCollectionVisibility(user.id, visibility),
      ])
      await refreshPreferences()
      setFeedback({ kind: 'ok', text: 'Preferencias guardadas.' })
    } catch (err) {
      setFeedback({ kind: 'error', text: err instanceof Error ? err.message : 'No se pudieron guardar.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-panel">
      <div className="flex flex-col gap-1.5">
        <span className="fsec-cap">Preferencias de colección</span>
        <p className="text-body-sm text-slate">Elige qué colecciones usas y quién puede verlas.</p>
      </div>

      <ul className="flex flex-col">
        {COLLECTIONS.map(({ key, label }) => (
          <li
            key={key}
            className="prow"
            style={{ '--ac': COLLECTIONS_BY_KEY[key].accent.spine } as CSSProperties}
          >
            <span className="dot" aria-hidden="true" />
            <input
              id={`pref-active-${key}`}
              type="checkbox"
              className="w-5 h-5 rounded accent-brand shrink-0"
              checked={active[key] ?? true}
              disabled={saving}
              onChange={(e) => setActive((a) => ({ ...a, [key]: e.target.checked }))}
            />
            <label htmlFor={`pref-active-${key}`} className="text-body font-medium text-ink flex-1 cursor-pointer">
              {label}
            </label>
            <select
              className="input !w-auto !py-1.5"
              value={visibility[key] ?? 'PUBLIC'}
              disabled={saving}
              onChange={(e) => setVisibility((v) => ({ ...v, [key]: e.target.value as CollectionVisibility }))}
              aria-label={`Visibilidad de ${label}`}
            >
              <option value="PUBLIC">Público</option>
              <option value="PRIVATE">Privado</option>
            </select>
          </li>
        ))}
      </ul>

      {feedback && (
        <p
          role={feedback.kind === 'error' ? 'alert' : 'status'}
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.kind === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="form-actions">
        <button className="btn-primary" type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}