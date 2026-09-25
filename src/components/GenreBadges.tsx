interface GenreBadgesProps {
  genres?: string[] | null
  className?: string
}

/** Tags pequeños con los géneros. No renderiza nada sin géneros. */
export default function GenreBadges({ genres, className = '' }: GenreBadgesProps) {
  if (!genres || genres.length === 0) return null
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {genres.map((genre) => (
        <span
          key={genre}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-brand-soft text-brand-deep"
        >
          {genre}
        </span>
      ))}
    </div>
  )
}
