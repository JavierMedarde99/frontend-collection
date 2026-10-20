import { useId, useState } from 'react'
import { platformLabel } from '../constants/games'

interface PlatformComboboxProps {
  value: string
  onChange: (next: string) => void
  options: string[]
}

/**
 * Select de plataforma con buscador (combobox WAI-ARIA).
 *
 * - El input es el campo del formulario: cada tecla llama a `onChange`, así que
 *   permite texto libre (el backend acepta cualquier `platform` con minLength 1).
 * - Al enfocar se abre el catálogo entero; el valor actual se mantiene en la
 *   lista aunque el filtro no lo coincida (invariante de los nombres legacy:
 *   PS2, WII_U… no aparecen en el catálogo y perderlos cambiaría la plataforma
 *   de un juego guardado en silencio).
 * - El desplegable muestra `platformLabel(name)`; lo que se guarda es el valor crudo.
 */
export default function PlatformCombobox({ value, onChange, options }: PlatformComboboxProps) {
  // null = sin búsqueda, mostrando el valor actual.
  const [query, setQuery] = useState<string | null>(null)
  // Valor al enfocar: sigue visible mientras se filtra, aunque el formulario
  // pase a tener el texto tecleado.
  const [snapshot, setSnapshot] = useState(value)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()

  const text = query ?? value
  const q = (query ?? '').trim().toLowerCase()
  const matches = options.filter((o) => o.toLowerCase().includes(q))
  // El snapshot va al final: así la opción resaltada por defecto (índice 0) es
  // la mejor coincidencia del filtro, no el valor anterior.
  const list = snapshot && !matches.includes(snapshot) ? [...matches, snapshot] : matches
  const idx = open && list.length > 0 ? Math.min(active, list.length - 1) : -1

  function choose(raw: string) {
    onChange(raw)
    setSnapshot(raw)
    setQuery(null)
    setOpen(false)
    setActive(0)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActive(0)
      } else if (idx >= 0) {
        setActive(Math.min(idx + 1, list.length - 1))
      }
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault()
      if (idx >= 0) setActive(Math.max(idx - 1, 0))
    } else if (e.key === 'Enter') {
      const pick = open && idx >= 0 ? list[idx] : undefined
      if (pick !== undefined) {
        e.preventDefault()
        choose(pick)
      }
    } else if (e.key === 'Escape') {
      setQuery(null)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <input
        className="input"
        role="combobox"
        aria-label="Plataforma"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={idx >= 0 ? `${listId}-${idx}` : undefined}
        autoComplete="off"
        placeholder="Buscar plataforma…"
        value={text}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => {
          setSnapshot(value)
          setQuery('')
          setActive(0)
          setOpen(true)
        }}
        onBlur={() => {
          setQuery(null)
          setOpen(false)
        }}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Plataformas"
          className="absolute left-0 right-0 z-30 mt-1 card !p-1.5 max-h-60 overflow-y-auto"
        >
          {list.length === 0 && (
            <li role="presentation" className="px-3 py-2 text-caption text-slate">
              Sin coincidencias
            </li>
          )}
          {list.map((raw, i) => (
            <li
              key={raw}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === idx}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(raw)}
              className={`px-3 py-2 rounded-lg cursor-pointer text-body-sm ${
                i === idx ? 'bg-brand-soft text-ink font-medium' : 'text-ink hover:bg-paper'
              }`}
            >
              {platformLabel(raw)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
