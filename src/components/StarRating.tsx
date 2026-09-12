import type { KeyboardEvent } from 'react'

interface StarRatingProps {
  value?: number
  onChange?: (value: number) => void
  readOnly?: boolean
}

export default function StarRating({ value = 0, onChange, readOnly = false }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]

  if (readOnly) {
    return (
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Valoración ${value || 0} de 5`}
      >
        {stars.map((n) => (
          <span
            key={n}
            className={`text-base leading-none ${
              n <= Math.round(value || 0) ? 'text-accent' : 'text-stone/40'
            }`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = e.key === 'ArrowRight'
      ? Math.min(5, (value || 0) + 1)
      : Math.max(1, (value || 0) - 1)
    onChange?.(next)
  }

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Valoración"
      onKeyDown={handleKeyDown}
    >
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange?.(n)}
          className={`text-2xl leading-none transition-all duration-150 ease-smooth cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm ${
            n <= value ? 'text-accent drop-shadow-sm' : 'text-stone/50 hover:text-accent/70'
          }`}
          aria-label={`${n} estrella${n === 1 ? '' : 's'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
