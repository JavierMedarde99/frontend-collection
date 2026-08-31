import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import StarRating from './StarRating'

export default function BookCard({ book, onDelete }) {
  return (
    <article className="card flex flex-col gap-5">
      <div className="flex gap-5">
        {book.frontpage ? (
          <img
            src={book.frontpage}
            alt={book.title}
            className="w-24 h-32 object-cover rounded shrink-0 bg-surface-muted"
          />
        ) : (
          <div className="w-24 h-32 rounded shrink-0 bg-surface-muted flex items-center justify-center text-label-sm text-on-surface-variant">
            Sin portada
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-headline-md mb-1 leading-snug font-medium">{book.title}</h3>
          <p className="text-body-md text-on-surface-variant">{book.author}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge state={book.state} />
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wide">
              {book.type}
            </span>
          </div>
        </div>
      </div>

      {book.comment && (
        <p className="text-body-md text-on-surface-variant line-clamp-2">{book.comment}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <StarRating value={book.start} readOnly />
        <div className="flex items-center gap-2">
          <Link className="btn-ghost !h-9 !px-4" to={`/editar/${book.id}`}>
            Editar
          </Link>
          {onDelete && (
            <button
              className="btn-ghost !h-9 !px-4 !text-red-600 hover:!bg-red-50"
              onClick={() => onDelete(book)}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
