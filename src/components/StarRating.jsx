export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5]

  if (readOnly) {
    return (
      <div className="flex items-center gap-0.5" aria-label={`Valoración ${value || 0} de 5`}>
        {stars.map((n) => (
          <span
            key={n}
            className={`text-base leading-none ${
              n <= Math.round(value || 0)
                ? 'text-ink'
                : 'text-stone/30'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition-colors ${
            n <= value ? 'text-ink' : 'text-stone/40 hover:text-stone/70'
          }`}
          aria-label={`${n} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  )
}