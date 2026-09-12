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
      className="card card-hover animate-fade-up relative flex flex-col gap-5 group"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="absolute top-3 right-3">
        <CardMenu detailTo={`/magic/${card.id}`} editTo={`/magic/${card.id}/editar`} itemName={card.name} onDelete={onDelete} />
      </div>
      <div className="flex gap-5">
        {card.imageUrl ? (
          <Link to={`/magic/${card.id}`} className="shrink-0 w-28 overflow-hidden rounded-xl shadow-sm bg-paper block">
            <img
              src={card.imageUrl}
              alt={card.name}
              loading="lazy"
              className="w-28 h-36 object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
          </Link>
        ) : (
          <Link to={`/magic/${card.id}`} className="w-28 h-36 rounded-xl shrink-0 bg-gradient-to-br from-brand-soft to-accent-soft border border-silver/60 flex flex-col items-center justify-center gap-1.5 text-caption text-graphite">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Sin imagen</span>
          </Link>
        )}
        <div className="min-w-0 flex-1 flex flex-col">
          <Link to={`/magic/${card.id}`} className="font-display text-heading-sm leading-snug line-clamp-2 text-ink hover:text-brand transition-colors">
            {card.name}
          </Link>
          <p className="text-body-sm text-graphite mt-1 line-clamp-1">
            {[card.manaCost, card.type].filter(Boolean).join(' · ') || card.setName || 'Magic'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {card.rarity && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-brand-soft text-brand uppercase">
                {card.rarity}
              </span>
            )}
            {card.setName && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-slate-100 text-slate-700">
                {card.setName}
              </span>
            )}
            {card.quantity && card.quantity > 1 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-emerald-100 text-emerald-800">
                x{card.quantity}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end pt-4 border-t border-silver/60">
        <ActionLink className="btn-ghost !px-3 !py-1.5" to={`/magic/${card.id}/editar`} label={`Editar ${card.name}`}>
          Editar
        </ActionLink>
      </div>
    </article>
  )
}
