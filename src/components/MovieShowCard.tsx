import { Link } from 'react-router-dom'
import MovieShowStatusBadge from './MovieShowStatusBadge'
import StarRating from './StarRating'
import { MEDIA_TYPE_LABELS, MEDIA_TYPE_BADGE_COLORS } from '../constants/movieshows'
import type { MovieShow } from '../types'

interface MovieShowCardProps {
  movieShow: MovieShow
  index?: number
}

export default function MovieShowCard({ movieShow, index = 0 }: MovieShowCardProps) {
  const typeColor = MEDIA_TYPE_BADGE_COLORS[movieShow.mediaType]
  const year = movieShow.releaseDate ? movieShow.releaseDate.slice(0, 4) : null

  return (
    <article
      className="card card-hover animate-fade-up flex flex-col gap-5 group"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="flex gap-5">
        {movieShow.posterUrl ? (
          <Link to={`/movieshows/${movieShow.id}`} className="shrink-0 w-28 overflow-hidden rounded-xl shadow-sm bg-paper block">
            <img
              src={movieShow.posterUrl}
              alt={movieShow.title}
              loading="lazy"
              className="w-28 h-36 object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
          </Link>
        ) : (
          <Link to={`/movieshows/${movieShow.id}`} className="w-28 h-36 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex flex-col items-center justify-center gap-1.5 text-caption text-graphite">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-2.625v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5m22.5-8.25v1.5c0 .621-.504 1.125-1.125 1.125m0 0h-1.5m1.5 0c.621 0 1.125.504 1.125 1.125v1.5m0 0h-1.5"
              />
            </svg>
            <span>Sin póster</span>
          </Link>
        )}
        <div className="min-w-0 flex-1 flex flex-col">
          <Link to={`/movieshows/${movieShow.id}`} className="font-display text-heading-sm leading-snug line-clamp-2 text-ink hover:text-brand transition-colors">
            {movieShow.title}
          </Link>
          <p className="text-body-sm text-graphite mt-1 line-clamp-1">{year || 'Película/Serie'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MovieShowStatusBadge status={movieShow.status} />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium ${typeColor}`}>
              {MEDIA_TYPE_LABELS[movieShow.mediaType] || movieShow.mediaType}
            </span>
          </div>
        </div>
      </div>

      {movieShow.overview && (
        <p className="text-body text-slate line-clamp-2">{movieShow.overview}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-silver/60">
        <StarRating value={movieShow.userRating} readOnly />
        <Link className="btn-ghost !px-3 !py-1.5" to={`/movieshows/editar/${movieShow.id}`}>
          Editar
        </Link>
      </div>
    </article>
  )
}
