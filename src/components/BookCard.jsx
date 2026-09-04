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
            className="w-24 h-32 object-cover rounded shrink-0 bg-paper"
          />
        ) : (
          <div className="w-24 h-32 rounded shrink-0 bg-paper flex items-center justify-center text-caption text-slate">
            Sin portada
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-heading mb-1 leading-snug">{book.title}</h3>
          <p className="text-body text-graphite">{book.author}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge state={book.state} />
            <span className="text-caption text-slate">{book.type}</span>
          </div>
        </div>
      </div>

      {book.comment && (
        <p className="text-body text-slate line-clamp-2">{book.comment}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <StarRating value={book.start} readOnly />
        <Link className="btn-ghost !px-3 !py-1" to={`/editar/${book.id}`}>
          Editar
        </Link>
      </div>
    </article>
  )
}