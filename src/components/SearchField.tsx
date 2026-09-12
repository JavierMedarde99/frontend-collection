import { useId, type FormEvent, type RefObject } from 'react'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  placeholder: string
  label: string
  inputRef?: RefObject<HTMLInputElement>
  loading?: boolean
  buttonLabel?: string
  shortcutHint?: boolean
  className?: string
  variant?: 'primary' | 'ghost'
}

/**
 * Buscador con input + botón. En móvil se apilan (sin solapes);
 * en sm+ van en fila con el botón fuera del input.
 */
export default function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder,
  label,
  inputRef,
  loading = false,
  buttonLabel = 'Buscar',
  shortcutHint = false,
  className = '',
  variant = 'primary',
}: SearchFieldProps) {
  const inputId = useId()
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="label !mb-0" htmlFor={inputId}>
        {label}
      </label>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
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
            ref={inputRef}
            className="input !pl-11"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-keyshortcuts={shortcutHint ? '/' : undefined}
            title={shortcutHint ? 'Atajo: / para buscar' : undefined}
          />
        </div>
        <button
          className={`${variant === 'ghost' ? 'btn-ghost' : 'btn-primary'} !py-2 !px-3.5 min-h-[44px] w-full sm:w-auto shrink-0`}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Buscando…' : buttonLabel}
          {shortcutHint && !loading && (
            <kbd className="ml-1 hidden sm:inline-block px-1 rounded bg-white/25 text-[10px] font-semibold" aria-hidden="true">/</kbd>
          )}
        </button>
      </form>
    </div>
  )
}
