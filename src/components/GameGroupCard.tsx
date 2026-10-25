import { Link } from 'react-router-dom'
import GameStatusBadge from './GameStatusBadge'
import GamePlatformBadge from './GamePlatformBadge'
import StarRating from './StarRating'
import GameStateDialog from './GameStateDialog'
import AcquisitionGameDialog from './AcquisitionGameDialog'
import CompleteGameDialog from './CompleteGameDialog'
import useGameRecordActions from '../hooks/useGameRecordActions'
import { GameStatus } from '../types'
import type { GameGroup } from '../types'

interface GameGroupCardProps {
  group: GameGroup
  index?: number
  readOnly?: boolean
  onDelete?: (gameId: string) => Promise<void>
}

export default function GameGroupCard({ group, index = 0, readOnly = false, onDelete }: GameGroupCardProps) {
  const firstGame = group.games[0]
  if (!firstGame) return null

  return (
    <article
      className="card card-hover animate-fade-up relative flex flex-col gap-5 group"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="flex gap-5">
        {group.thumbnailUrl || firstGame?.thumbnailUrl ? (
          <Link to={`/juegos/${firstGame.id}`} className="shrink-0 w-28 overflow-hidden rounded-xl shadow-sm bg-paper block">
            <img
              src={group.thumbnailUrl || firstGame?.thumbnailUrl || ''}
              alt={group.title}
              loading="lazy"
              className="w-28 h-36 object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
          </Link>
        ) : (
          <Link to={`/juegos/${firstGame.id}`} className="w-28 h-36 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex flex-col items-center justify-center gap-1.5 text-caption text-graphite">
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
          <Link to={`/juegos/${firstGame.id}`} className="font-display text-heading-sm leading-snug line-clamp-2 text-ink hover:text-brand transition-colors">
            {group.title}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption bg-brand-soft text-ink">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand" />
              {group.games.length} plataforma{group.games.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <ul role="list" className="flex flex-col gap-3">
        {group.games.map((game) => (
          <GameRow key={game.id} game={game} groupTitle={group.title} readOnly={readOnly} onDelete={onDelete} />
        ))}
      </ul>
    </article>
  )
}

function GameRow({ game, groupTitle, readOnly = false, onDelete }: { game: GameGroup['games'][0]; groupTitle: string; readOnly?: boolean; onDelete?: (id: string) => Promise<void> }) {
  const {
    record: shown,
    saving,
    actionError,
    openPlaying,
    openAcquiring,
    openCompleting,
    setOpenPlaying,
    setOpenAcquiring,
    setOpenCompleting,
    onSavePlaying,
    onSaveAcquiring,
    onSaveComplete,
  } = useGameRecordActions(game)

  return (
    <li role="listitem" className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3 border-t border-silver/60">
      <div className="flex items-center gap-3">
        <GamePlatformBadge platform={game.platform} />
        <GameStatusBadge status={shown.status} />
        <StarRating value={shown.userRating} readOnly />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!readOnly && (
          <>
            {shown.status === GameStatus.WISHLIST && (
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5"
                aria-label={`Marcar ${groupTitle} (${game.platform}) como en posesión`}
                onClick={() => setOpenAcquiring(true)}
                disabled={saving}
              >
                En posesión
              </button>
            )}
            {shown.status === GameStatus.OWNED && (
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5"
                aria-label={`Empezar a jugar a ${groupTitle} (${game.platform})`}
                onClick={() => setOpenPlaying(true)}
                disabled={saving}
              >
                Jugando
              </button>
            )}
            {shown.status === GameStatus.PLAYING && (
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5"
                aria-label={`Marcar ${groupTitle} (${game.platform}) como completado`}
                onClick={() => setOpenCompleting(true)}
                disabled={saving}
              >
                Completado
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn-ghost !px-3 !py-1.5 text-red-600"
                aria-label={`Eliminar ${groupTitle} (${game.platform})`}
                onClick={() => onDelete(game.id)}
                disabled={saving}
              >
                Eliminar
              </button>
            )}
          </>
        )}
      </div>

      {actionError && (
        <p className="text-caption text-red-600 w-full -mt-1" role="alert">{actionError}</p>
      )}

      {openPlaying && (
        <GameStateDialog
          title="¡A jugar!"
          description="El videojuego pasará a «Jugando»."
          dateLabel="Fecha de inicio"
          dateValue={shown.dateAdded}
          onSave={(date: string) => onSavePlaying(date)}
          onClose={() => setOpenPlaying(false)}
          busy={saving}
        />
      )}

      {openAcquiring && (
        <AcquisitionGameDialog
          acquisitionDate={shown.acquisitionDate}
          acquisitionPrice={shown.acquisitionPrice}
          onSave={(acquisitionDate: string, acquisitionPrice: number) => onSaveAcquiring(acquisitionDate, acquisitionPrice)}
          onClose={() => setOpenAcquiring(false)}
          busy={saving}
        />
      )}

      {openCompleting && (
        <CompleteGameDialog
          dateValue={shown.dateCompleted}
          ratingValue={shown.userRating}
          commentValue={shown.comment}
          onSave={(date: string, rating: number, comment: string) => onSaveComplete(date, rating, comment)}
          onClose={() => setOpenCompleting(false)}
          busy={saving}
        />
      )}
    </li>
  )
}
