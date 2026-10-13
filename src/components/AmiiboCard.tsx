import OwnerLine from './OwnerLine'
import FigureStatusBadge from './FigureStatusBadge'
import { AMIIBO_TYPE_LABELS } from '../constants/figures'
import type { Amiibo } from '../types'

interface AmiiboCardProps {
  amiibo: Amiibo
  index?: number
  readOnly?: boolean
}

export default function AmiiboCard({ amiibo, index = 0, readOnly = false }: AmiiboCardProps) {
  const typeLabel = amiibo.amiiboType
    ? AMIIBO_TYPE_LABELS[amiibo.amiiboType as keyof typeof AMIIBO_TYPE_LABELS]
    : null

  const series = [amiibo.amiiboSeries, amiibo.gameSeries].filter(Boolean).join(' · ')
  const releaseDates = [
    amiibo.releaseDates?.na ? `EE. UU. ${amiibo.releaseDates.na}` : null,
    amiibo.releaseDates?.eu ? `Europa ${amiibo.releaseDates.eu}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const compatibleCount = amiibo.compatibleGames?.length ?? 0
  const compatible = compatibleCount
    ? `Compatible con ${compatibleCount} juego${compatibleCount === 1 ? '' : 's'}`
    : null
  const details = [series || null, releaseDates || null, compatible].filter(Boolean).join(' · ')

  return (
    <article
      className="card card-hover animate-fade-up relative flex flex-col gap-5 group"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="flex gap-5">
        {amiibo.imageUrl ? (
          <div className="shrink-0 w-28 overflow-hidden rounded-xl shadow-sm bg-paper">
            <img
              src={amiibo.imageUrl}
              alt={amiibo.name}
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
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span>Sin imagen</span>
          </div>
        )}
        <div className="min-w-0 flex-1 flex flex-col">
          <h3 className="font-display text-heading-sm leading-snug line-clamp-2 text-ink">{amiibo.name}</h3>
          {readOnly && <OwnerLine owner={amiibo.userOwned} />}
          <p className="text-body-sm text-graphite mt-1 line-clamp-1">{amiibo.character || 'Amiibo'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FigureStatusBadge status={amiibo.status} />
            {typeLabel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-brand-soft text-brand">
                {typeLabel}
              </span>
            )}
          </div>
          {details && <p className="mt-2 text-caption text-graphite line-clamp-1">{details}</p>}
        </div>
      </div>

      {amiibo.notes && <p className="text-body text-slate line-clamp-2">{amiibo.notes}</p>}
    </article>
  )
}
