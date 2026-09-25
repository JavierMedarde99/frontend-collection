import { useEffect, useState } from 'react'

interface GenreSelectProps {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  fetchSuggestions?: () => Promise<string[]>
  allowCustom?: boolean
}

/** Multiselect de géneros: lista cerrada + en uso (backend) + personalizados. */
export default function GenreSelect({ options, value, onChange, fetchSuggestions, allowCustom = true }: GenreSelectProps) {
  const [custom, setCustom] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

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

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[...options, ...extra].map((genre) => {
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
      {allowCustom && (
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
      )}
    </div>
  )
}
