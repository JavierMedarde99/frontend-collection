import { useId } from 'react'

interface ListSearchInputProps {
  value: string
  onChange: (next: string) => void
  /** Filas que quedan tras el filtro y total del catálogo, para el contador. */
  count: number
  total: number
  placeholder: string
  ariaLabel: string
}

/**
 * Buscador para listas dentro de un diálogo (expansiones de BGG, contenido de
 * RAWG). Filtra filas ya cargadas, así que es solo un input de texto con
 * contador: no busca en el catálogo externo ni dispara peticiones.
 */
export default function ListSearchInput({ value, onChange, count, total, placeholder, ariaLabel }: ListSearchInputProps) {
  const inputId = useId()
  const filtering = value.trim() !== ''

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <div className="relative">
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-stone absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          id={inputId}
          type="search"
          className="input !pl-11"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
      </div>
      <p className="text-caption text-stone" role="status">
        {filtering ? `${count} de ${total}` : `${total} en total`}
      </p>
      {filtering && count === 0 && (
        <p role="alert" className="text-caption text-red-600">
          No hay coincidencias con «{value.trim()}».
        </p>
      )}
    </div>
  )
}
