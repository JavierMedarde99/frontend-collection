import { useEffect, useId, useState } from 'react'

interface GenreSelectProps {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  fetchSuggestions?: () => Promise<string[]>
  allowCustom?: boolean
  dropdown?: boolean
}

/** Multiselect de géneros: chips inline o desplegable con checkboxes. */
export default function GenreSelect({ options, value, onChange, fetchSuggestions, allowCustom = true, dropdown = false }: GenreSelectProps) {
  const [custom, setCustom] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!fetchSuggestions) return
    let cancelled = false
    fetchSuggestions()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setSuggestions(list)
      })
      .catch(() => {
        // Sin sugerencias: el selector sigue con la lista cerrada.
      })
    return () => {
      cancelled = true
    }
  }, [fetchSuggestions])

  function toggle(genre: string) {
    onChange(value.includes(genre) ? value.filter((g) => g !== genre) : [...value, genre])
  }

  function addCustom() {
    const name = custom.trim()
    if (!name) return
    if (!value.some((g) => g.toLowerCase() === name.toLowerCase())) {
      onChange([...value, name])
    }
    setCustom('')
  }

  const seen = new Set(options)
  const extra = [...suggestions, ...value].filter((g) => {
    if (seen.has(g)) return false
    seen.add(g)
    return true
  })
  const all = [...options, ...extra]

  const customInput = allowCustom && (
    <div className="flex gap-2 mt-3">
      <input
        className="input"
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addCustom()
          }
        }}
        placeholder="Otro género…"
        aria-label="Añadir género personalizado"
      />
      <button type="button" className="btn-ghost !px-4 shrink-0" onClick={addCustom}>
        Añadir
      </button>
    </div>
  )

  if (dropdown) {
    const label = value.length === 0 ? 'Todos los géneros' : value.length === 1 ? value[0] : `${value.length} géneros`
    return (
      <div className="relative">
        <button
          type="button"
          className="input flex items-center justify-between gap-2 text-left"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={value.length === 0 ? 'text-stone' : 'text-ink font-medium'}>{label}</span>
          <svg
            aria-hidden="true"
            className={`w-4 h-4 shrink-0 text-stone transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} aria-hidden="true" />
            <div
              id={panelId}
              role="group"
              aria-label="Elegir géneros"
              className="absolute left-0 right-0 z-30 mt-2 card !p-3 max-h-72 overflow-y-auto"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
              }}
            >
              {all.length === 0 && (
                <p className="text-caption text-slate px-2 py-1">Sin géneros disponibles</p>
              )}
              {all.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-paper cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-brand shrink-0"
                    checked={value.includes(genre)}
                    onChange={() => toggle(genre)}
                  />
                  <span className="text-body text-ink line-clamp-1">{genre}</span>
                </label>
              ))}
              {customInput}
              <div className="flex justify-between gap-2 mt-3 pt-3 border-t border-silver/60">
                <button
                  type="button"
                  className="btn-ghost !px-3 !py-1.5"
                  onClick={() => onChange([])}
                  disabled={value.length === 0}
                >
                  Limpiar
                </button>
                <button type="button" className="btn-primary !px-4 !py-1.5" onClick={() => setOpen(false)}>
                  Ver resultados
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {all.map((genre) => {
          const active = value.includes(genre)
          return (
            <button
              key={genre}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(genre)}
              className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-brand text-white shadow-brand-glow'
                  : 'bg-white text-graphite border border-silver hover:border-brand hover:text-brand'
              }`}
            >
              {genre}
            </button>
          )
        })}
      </div>
      {customInput}
    </div>
  )
}
