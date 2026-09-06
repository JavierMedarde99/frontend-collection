import { Link } from 'react-router-dom'
import GameStatusBadge from './GameStatusBadge'
import GamePlatformBadge from './GamePlatformBadge'
import StarRating from './StarRating'
import type { Game } from '../types'

interface GameCardProps {
  game: Game
  index?: number
}

export default function GameCard({ game, index = 0 }: GameCardProps) {
  return (
    <article
      className="card card-hover animate-fade-up flex flex-col gap-5 group"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="flex gap-5">
        {game.thumbnailUrl ? (
          <div className="shrink-0 w-28 overflow-hidden rounded-xl shadow-sm bg-paper">
            <img
              src={game.thumbnailUrl}
              alt={game.title}
              loading="lazy"
              className="w-28 h-36 object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
          </div>
        ) : (
          <div className="w-28 h-36 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex flex-col items-center justify-center gap-1.5 text-caption text-graphite">
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
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
            <span>Sin imagen</span>
          </div>
        )}
        <div className="min-w-0 flex-1 flex flex-col">
          <h3 className="font-display text-heading-sm leading-snug line-clamp-2 text-ink">
            {game.title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <GameStatusBadge status={game.status} />
            <GamePlatformBadge platform={game.platform} />
          </div>
        </div>
      </div>

      {game.comment && (
        <p className="text-body text-slate line-clamp-2">{game.comment}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-silver/60">
        <StarRating value={game.userRating} readOnly />
        <Link className="btn-ghost !px-3 !py-1.5" to={`/juegos/editar/${game.id}`}>
          Editar
        </Link>
      </div>
    </article>
  )
}
