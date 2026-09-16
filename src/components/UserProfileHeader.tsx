import { COLLECTIONS } from '../constants/collections'
import type { PublicProfileResponse } from '../types'

interface UserProfileHeaderProps {
  profile: PublicProfileResponse
}

/** Cabecera de perfil público: avatar, nombres, bio y colecciones públicas. */
export default function UserProfileHeader({ profile }: UserProfileHeaderProps) {
  const initial = (profile.displayName || profile.username || '?').slice(0, 1).toUpperCase()
  const counts = profile.publicCollectionCounts || {}
  const visible = COLLECTIONS.filter(({ key }) => (counts[key] ?? 0) > 0)

  return (
    <div className="card p-6 md:p-8 flex flex-col gap-5">
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
            className="w-20 h-20 rounded-full shrink-0 bg-gradient-to-br from-brand to-accent flex items-center justify-center font-display text-heading-lg text-white"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
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
        <div className="flex flex-col gap-2 border-t border-silver/60 pt-4">
          <h2 className="text-caption font-semibold uppercase tracking-wide text-stone">
            Colecciones públicas
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visible.map(({ key, label }) => (
              <li
                key={key}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-brand-soft/50 border border-silver/60"
              >
                <span className="text-body-sm font-medium text-ink line-clamp-1">{label}</span>
                <span className="text-body-sm font-bold text-brand tabular-nums shrink-0">
                  {counts[key]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
