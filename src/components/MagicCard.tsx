import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import CardMenu from './CardMenu'
import OwnerLine from './OwnerLine'
import type { MagicCardResponse } from '../types'

interface MagicCardProps {
  card: MagicCardResponse
  index?: number
  onDelete: () => Promise<void>
  readOnly?: boolean
  onAddCopies?: (quantity: number) => Promise<void>
}

export default function MagicCard({ card, index = 0, onDelete, readOnly = false, onAddCopies }: MagicCardProps) {
  const [adding, setAdding] = useState(false)
  const [copies, setCopies] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAddCopies(e: FormEvent) {
    e.preventDefault()
    if (!onAddCopies || busy) return
    setBusy(true)
    setError(null)
    try {
      await onAddCopies(copies)
      setAdding(false)
      setCopies(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron añadir las copias.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article
      className="card card-hover animate-fade-up relative flex flex-col gap-5 group"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      {!readOnly && (
        <div className="absolute top-3 right-3">
          <CardMenu detailTo={`/magic/${card.id}`} itemName={card.name} onDelete={onDelete} />
        </div>
      )}
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
            {readOnly && <OwnerLine owner={card.userOwned} />}
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
            {typeof card.quantity === 'number' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-emerald-100 text-emerald-800">
                x{card.quantity}
              </span>
            )}
          </div>
          {onAddCopies && !readOnly && (
            <div className="mt-3">
              {adding ? (
                <form onSubmit={handleAddCopies} className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`copies-${card.id}`}>
                    Copias a añadir
                  </label>
                  <input
                    id={`copies-${card.id}`}
                    className="input w-20 !py-1.5"
                    type="number"
                    min="1"
                    step="1"
                    value={copies}
                    disabled={busy}
                    onChange={(e) => setCopies(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
                  />
                  <button type="submit" className="btn-primary !px-3 !py-1.5" disabled={busy}>
                    {busy ? 'Añadiendo…' : 'Añadir'}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !px-3 !py-1.5"
                    disabled={busy}
                    onClick={() => {
                      setAdding(false)
                      setError(null)
                    }}
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="btn-ghost !px-3 !py-1.5"
                  onClick={() => {
                    setAdding(true)
                    setError(null)
                  }}
                >
                  + Añadir copias
                </button>
              )}
              {error && (
                <p role="alert" className="text-caption text-red-600 mt-1">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
