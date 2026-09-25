interface GenreBadgesProps {
  genres?: string[] | null
  className?: string
  max?: number
}

/** Tags pequeños con los géneros. `max` limita cuántos se muestran (listas). */
export default function GenreBadges({ genres, className = '', max }: GenreBadgesProps) {
  if (!genres || genres.length === 0) return null
  const visible = max !== undefined ? genres.slice(0, max) : genres
  if (visible.length === 0) return null
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {visible.map((genre) => (
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
