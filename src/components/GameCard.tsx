import { Link } from 'react-router-dom'
import ActionLink from './ActionLink'
import CardMenu from './CardMenu'
import GameStatusBadge from './GameStatusBadge'
import GamePlatformBadge from './GamePlatformBadge'
import GamePlatinumBadge from './GamePlatinumBadge'
import StarRating from './StarRating'
import { GamePlatform } from '../types'
import type { Game } from '../types'

interface GameCardProps {
  game: Game
  index?: number
  onDelete: () => Promise<void>
}

export default function GameCard({ game, index = 0, onDelete }: GameCardProps) {
  return (
    <article
      className="card card-hover animate-fade-up relative flex flex-col gap-5 group"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="absolute top-3 right-3">
        <CardMenu detailTo={`/juegos/${game.id}`} editTo={`/juegos/editar/${game.id}`} itemName={game.title} onDelete={onDelete} />
      </div>
      <div className="flex gap-5">
        {game.thumbnailUrl ? (
          <Link to={`/juegos/${game.id}`} className="shrink-0 w-28 overflow-hidden rounded-xl shadow-sm bg-paper block">
            <img
              src={game.thumbnailUrl}
              alt={game.title}
              loading="lazy"
              className="w-28 h-36 object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
          </Link>
        ) : (
          <Link to={`/juegos/${game.id}`} className="w-28 h-36 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex flex-col items-center justify-center gap-1.5 text-caption text-graphite">
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
          </Link>
        )}
        <div className="min-w-0 flex-1 flex flex-col">
          <Link to={`/juegos/${game.id}`} className="font-display text-heading-sm leading-snug line-clamp-2 text-ink hover:text-brand transition-colors">
            {game.title}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <GameStatusBadge status={game.status} />
            <GamePlatformBadge platform={game.platform} />
            <GamePlatinumBadge game={game} />
          </div>
        </div>
      </div>

      {game.comment && (
        <p className="text-body text-slate line-clamp-2">{game.comment}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-silver/60">
        <StarRating value={game.userRating} readOnly />
        <div className="flex items-center gap-2">
          {game.steamAppId && game.platform === GamePlatform.PC && (
            <Link className="btn-ghost !px-3 !py-1.5 flex items-center gap-1.5" to={`/juegos/${game.id}/logros`}>
              <svg
                aria-hidden="true"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
              </svg>
              Ver logros
            </Link>
          )}
          <ActionLink className="btn-ghost !px-3 !py-1.5" to={`/juegos/editar/${game.id}`} label={`Editar ${game.title}`}>
            Editar
          </ActionLink>
        </div>
      </div>
    </article>
  )
}
