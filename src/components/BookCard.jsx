import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import StarRating from './StarRating'
import { TYPE_LABELS, TYPE_BADGE_COLORS } from '../constants/books'

export default function BookCard({ book }) {
  const typeColor = TYPE_BADGE_COLORS[book.type] || TYPE_BADGE_COLORS.NOVEL
  return (
    <article className="card card-hover flex flex-col gap-5">
      <div className="flex gap-5">
        {book.frontpage ? (
          <img
            src={book.frontpage}
            alt={book.title}
            loading="lazy"
            className="w-24 h-32 object-cover rounded shadow-sm shrink-0 bg-paper"
          />
        ) : (
          <div className="w-24 h-32 rounded shrink-0 bg-paper border border-silver/60 flex flex-col items-center justify-center gap-1 text-caption text-slate">
            <svg
              aria-hidden="true"
              className="w-6 h-6 text-stone"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span>Sin portada</span>
          </div>
        )}
        <div className="min-w-0 flex-1 flex flex-col">
          <h3 className="font-display text-heading-sm leading-snug line-clamp-2">{book.title}</h3>
          <p className="text-body text-graphite mt-1 line-clamp-1">{book.author}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge state={book.state} />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption ${typeColor}`}>
              {TYPE_LABELS[book.type] || book.type}
            </span>
          </div>
        </div>
      </div>

      {book.comment && (
        <p className="text-body text-slate line-clamp-2">{book.comment}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-silver/60">
        <StarRating value={book.start} readOnly />
        <Link className="btn-ghost !px-3 !py-1.5" to={`/editar/${book.id}`}>
          Editar
        </Link>
      </div>
    </article>
  )
}