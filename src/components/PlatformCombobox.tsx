import { useId, useState } from 'react'
import { platformLabel } from '../constants/games'

interface PlatformComboboxBaseProps {
  options: string[]
  /** Entrada para limpiar el filtro: «Todas las plataformas». */
  emptyOptionLabel?: string
  /** false en filtros: escribir solo busca, no crea ni aplica valores. */
  allowCustom?: boolean
  placeholder?: string
  ariaLabel?: string
}

/** Formularios: valor único y (por defecto) texto libre. */
interface SingleProps extends PlatformComboboxBaseProps {
  multiple?: false
  value?: string
  onChange: (next: string) => void
  values?: never
}

/** Filtros: multiselección con checkboxes. */
interface MultipleProps extends PlatformComboboxBaseProps {
  multiple: true
  values: string[]
  onChange: (next: string[]) => void
  value?: never
}

type PlatformComboboxProps = SingleProps | MultipleProps

/**
 * Select de plataforma con buscador (combobox WAI-ARIA).
 *
 * - Al enfocar se abre el catálogo entero; el valor actual se mantiene en la
 *   lista aunque el filtro no lo coincida (invariante de los nombres legacy:
 *   PS2, WII_U… no aparecen en el catálogo y perderlos cambiaría la plataforma
 *   de un juego guardado en silencio, o dejaría el filtro en un valor imposible).
 * - El desplegable muestra `platformLabel(name)`; lo que se guarda es el valor crudo.
 * - Selección única (formularios): el input es el campo y cada tecla llama a
 *   `onChange`, así que admite texto libre. Con `allowCustom={false}` (filtros)
 *   escribir solo filtra.
 * - `multiple` (filtro del listado): checkboxes que no cierran el desplegable y
 *   resumen en el input.
 */
export default function PlatformCombobox(props: PlatformComboboxProps) {
  const { options, emptyOptionLabel, allowCustom = true } = props
  const placeholder = props.placeholder ?? 'Buscar plataforma…'
  const ariaLabel = props.ariaLabel ?? 'Plataforma'
  // null = sin búsqueda, mostrando el valor actual.
  const [query, setQuery] = useState<string | null>(null)
  // Valor al enfocar: sigue visible mientras se filtra, aunque el formulario
  // pase a tener el texto tecleado.
  const [snapshot, setSnapshot] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()

  const q = (query ?? '').trim().toLowerCase()
  const matches = options.filter((o) => o.toLowerCase().includes(q))
  // Los valores activos van al final: así la opción resaltada por defecto (índice 0)
  // es la mejor coincidencia del filtro, no un valor anterior.
  const missing = snapshot.filter((s) => !matches.includes(s))
  const list = [...matches, ...missing]
  const idx = open && list.length > 0 ? Math.min(active, list.length - 1) : -1

  // Selección normalizada a lista: el resto del componente no necesita saber el
  // modo para pintar el resumen, las marcas ni la opción de «todas».
  const multiple = props.multiple === true
  const selected = props.multiple === true ? props.values : props.value ? [props.value] : []
  const summary = selected.map(platformLabel).join(', ')
  const text = query ?? summary

  function toggle(raw: string) {
    const next = selected.includes(raw) ? selected.filter((v) => v !== raw) : [...selected, raw]
    commit(next)
  }

  function clearAll() {
    commit([])
  }

  /** Aplica una selección nueva respetando el tipo del modo (único o múltiple). */
  function commit(next: string[]) {
    if (props.multiple === true) props.onChange(next)
    else props.onChange(next[0] ?? '')
    setSnapshot(next)
    setQuery(null)
    setActive(0)
  }

  function pick(raw: string) {
    if (props.multiple === true) {
      toggle(raw)
      return
    }
    props.onChange(raw)
    setSnapshot([raw])
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
      const chosen = open && idx >= 0 ? list[idx] : undefined
      if (chosen !== undefined) {
        e.preventDefault()
        pick(chosen)
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
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={idx >= 0 ? `${listId}-${idx}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          if (!allowCustom) {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
            return
          }
          setQuery(e.target.value)
          if (props.multiple !== true) props.onChange(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => {
          setSnapshot(selected)
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
          {emptyOptionLabel && (
            <li
              role="option"
              aria-selected={selected.length === 0}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                clearAll()
                setOpen(false)
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-body-sm ${
                selected.length === 0 ? 'bg-brand-soft text-ink font-medium' : 'text-ink hover:bg-paper'
              }`}
            >
              {multiple && (
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-brand shrink-0 pointer-events-none"
                  checked={selected.length === 0}
                  readOnly
                  tabIndex={-1}
                  aria-label={emptyOptionLabel}
                />
              )}
              {emptyOptionLabel}
            </li>
          )}
          {list.length === 0 && !emptyOptionLabel && (
            <li role="presentation" className="px-3 py-2 text-caption text-slate">
              Sin coincidencias
            </li>
          )}
          {list.map((raw, i) => {
            const label = platformLabel(raw)
            const chosen = selected.includes(raw)
            // Con la opción de «todas», los índices de opción van un puesto después.
            const optionIndex = emptyOptionLabel ? i + 1 : i
            const highlighted = optionIndex === idx
            return (
              <li
                key={raw}
                id={`${listId}-${optionIndex}`}
                role="option"
                aria-selected={chosen || highlighted}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(raw)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-body-sm ${
                  highlighted ? 'bg-brand-soft text-ink font-medium' : 'text-ink hover:bg-paper'
                }`}
              >
                {multiple && (
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-brand shrink-0 pointer-events-none"
                    checked={chosen}
                    readOnly
                    tabIndex={-1}
                    aria-label={label}
                  />
                )}
                {label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
