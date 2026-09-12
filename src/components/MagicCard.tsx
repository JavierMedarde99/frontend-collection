import { Link } from 'react-router-dom'
import ActionLink from './ActionLink'
import CardMenu from './CardMenu'
import type { MagicCardResponse } from '../types'

interface MagicCardProps {
  card: MagicCardResponse
  index?: number
  onDelete: () => Promise<void>
}

export default function MagicCard({ card, index = 0, onDelete }: MagicCardProps) {
  return (
    <article
      className="card card-hover animate-fade-up relative flex flex-col group p-4 gap-3"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="absolute top-3 right-3">
        <CardMenu detailTo={`/magic/${card.id}`} editTo={`/magic/${card.id}/editar`} itemName={card.name} onDelete={onDelete} />
      </div>
      <Link to={`/magic/${card.id}`} className="block overflow-hidden rounded-xl bg-paper aspect-[5/7] shadow-sm relative group">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex flex-col items-center justify-center gap-1.5 text-caption text-graphite p-2 text-center">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Sin imagen</span>
          </div>
        )}
      </Link>
      <div className="flex flex-col gap-1">
        <Link to={`/magic/${card.id}`} className="font-display text-heading-sm leading-snug line-clamp-1 text-ink hover:text-brand transition-colors">
          {card.name}
        </Link>
        <div className="flex items-center justify-between text-caption text-graphite">
          <span>{card.setName || card.rarity || 'Magic'}</span>
          {card.quantity && card.quantity > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-soft text-brand font-medium">
              x{card.quantity}
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end pt-3 border-t border-silver/60">
        <ActionLink className="btn-ghost !px-3 !py-1.5" to={`/magic/${card.id}/editar`} label={`Editar ${card.name}`}>
          Editar
        </ActionLink>
      </div>
    </article>
  )
}
