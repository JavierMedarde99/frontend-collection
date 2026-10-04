import type { CSSProperties } from 'react'
import { COLLECTIONS, COLLECTIONS_BY_KEY } from '../constants/collections'
import type { PublicProfileResponse } from '../types'

interface UserProfileHeaderProps {
  profile: PublicProfileResponse
}

/** Cabecera de perfil: avatar brand, nombre, bio y chips de colecciones públicas. */
export default function UserProfileHeader({ profile }: UserProfileHeaderProps) {
  const initial = (profile.displayName || profile.username || '?').slice(0, 1).toUpperCase()
  const counts = profile.publicCollectionCounts || {}
  const visible = COLLECTIONS.filter(({ key }) => (counts[key] ?? 0) > 0)

  return (
    <div className="prof-card flex flex-col gap-5">
      <div className="flex items-center gap-4">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={`Avatar de ${profile.username}`}
            className="w-20 h-20 rounded-full object-cover shadow-sm bg-paper shrink-0"
          />
        ) : (
          <span
            aria-hidden="true"
            className="avatar w-20 h-20 text-heading-lg shrink-0 shadow-lg"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <span className="eyebrow block mb-1">Perfil</span>
          <h1 className="font-display text-heading-lg text-ink line-clamp-1">
            {profile.displayName || profile.username}
          </h1>
          <p className="text-body-sm text-graphite">@{profile.username}</p>
        </div>
      </div>

      {profile.bio && (
        <p className="text-body text-slate whitespace-pre-line">{profile.bio}</p>
      )}

      {visible.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-silver/60 pt-4">
          <span className="fsec-cap">Colecciones públicas</span>
          <div className="flex flex-wrap gap-2">
            {visible.map(({ key, label }) => (
              <span
                key={key}
                className="chip-niche"
                style={{ '--ac': COLLECTIONS_BY_KEY[key].accent.spine } as CSSProperties}
              >
                {label} <b className="font-bold tabular-nums">{counts[key]}</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}