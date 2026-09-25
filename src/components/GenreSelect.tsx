import { useState } from 'react'

interface GenreSelectProps {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
}

/** Multiselect de géneros: chips de la lista cerrada + alta de personalizados. */
export default function GenreSelect({ options, value, onChange }: GenreSelectProps) {
  const [custom, setCustom] = useState('')

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

  const customOptions = value.filter((g) => !options.includes(g))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[...options, ...customOptions].map((genre) => {
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
    </div>
  )
}
