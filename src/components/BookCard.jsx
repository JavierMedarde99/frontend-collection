import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import StarRating from './StarRating'

export default function BookCard({ book }) {
  return (
    <article className="card flex flex-col gap-5">
      <div className="flex gap-5">
        {book.frontpage ? (
          <img
            src={book.frontpage}
            alt={book.title}
            className="w-24 h-32 object-cover rounded shrink-0 bg-lifted-cream"
          />
        ) : (
          <div className="w-24 h-32 rounded shrink-0 bg-lifted-cream flex items-center justify-center text-eyebrow text-slate-gray">
            Sin portada
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-h3-card mb-1 leading-snug font-medium">{book.title}</h3>
          <p className="text-body text-slate-gray">{book.author}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge state={book.state} />
            <span className="text-eyebrow text-slate-gray uppercase tracking-wide">
              {book.type}
            </span>
          </div>
        </div>
      </div>

      {book.comment && (
        <p className="text-body text-slate-gray line-clamp-2">{book.comment}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <StarRating value={book.start} readOnly />
        <Link className="btn-ghost !h-9 !px-4" to={`/editar/${book.id}`}>
          Editar
        </Link>
      </div>
    </article>
  )
}
