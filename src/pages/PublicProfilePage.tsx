import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicProfile, getUserBoardGames, getUserBooks, getUserDecks, getUserGames, getUserMagicCards, getUserMovieShows } from '../api/usersApi'
import type { PublicProfileResponse } from '../types'
import { COLLECTIONS } from '../constants/collections'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import UserProfileHeader from '../components/UserProfileHeader'
import SkeletonGrid from '../components/Skeleton'
import SkeletonInline from '../components/SkeletonInline'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'
import Breadcrumbs from '../components/Breadcrumbs'
import Spinner from '../components/Spinner'
import { usePageTitle } from '../hooks/usePageTitle'

const PRIVATE_MESSAGE = 'PRIVATE_COLLECTION'
const PAGE_SIZE = 12

interface PublicItem {
  key: string
  title: string
  subtitle?: string
  imageUrl?: string
}

function toPublicItem(collection: string, item: any): PublicItem {
  switch (collection) {
    case 'books':
      return { key: item.id, title: item.title, subtitle: item.author, imageUrl: item.frontpage }
    case 'games':
      return { key: item.id, title: item.title, subtitle: item.platform, imageUrl: item.thumbnailUrl }
    case 'magic':
      return { key: item.id, title: item.name, subtitle: item.setName || item.type, imageUrl: item.imageUrl }
    case 'decks':
      return { key: item.id, title: item.name, subtitle: item.commander, imageUrl: undefined }
    case 'boardgames':
      return { key: item.id, title: item.title, subtitle: item.publisher, imageUrl: item.imageUrl || item.thumbnailUrl }
    default:
      return { key: item.id, title: item.title, subtitle: item.releaseDate?.slice(0, 4), imageUrl: item.posterUrl }
  }
}

async function fetchUserCollection(username: string, collection: string, page: number, size: number) {
  switch (collection) {
    case 'books':
      return getUserBooks(username, page, size)
    case 'games':
      return getUserGames(username, page, size)
    case 'magic':
      return getUserMagicCards(username, page, size)
    case 'decks':
      return getUserDecks(username, page, size)
    case 'boardgames':
      return getUserBoardGames(username, page, size)
    default:
      return getUserMovieShows(username, page, size)
  }
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [collection, setCollection] = useState('books')

  usePageTitle(username ? `Perfil de ${username}` : 'Perfil público')

  useEffect(() => {
    if (!username) return
    let cancelled = false
    setLoadingProfile(true)
    setProfileError(null)
    setProfile(null)
    getPublicProfile(username)
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        const counts = data.publicCollectionCounts || {}
        const first = COLLECTIONS.find(({ key }) => (counts[key] ?? 0) > 0)?.key || 'books'
        setCollection(first)
      })
      .catch((err) => {
        if (cancelled) return
        setProfileError(err instanceof Error ? err.message : 'No se pudo cargar el perfil.')
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false)
      })
    return () => {
      cancelled = true
    }
  }, [username])

  const {
    items,
    hasMore,
    loading: loadingItems,
    loadingMore,
    error: itemsError,
    sentinelRef,
  } = useInfiniteScroll<PublicItem>({
    size: PAGE_SIZE,
    errorMessage: 'No se pudieron cargar los elementos.',
    enabled: profile !== null,
    fetchPage: async (page, size) => {
      try {
        const data = await fetchUserCollection(username ?? '', collection, page, size)
        return { ...data, content: (data.content || []).map((item) => toPublicItem(collection, item)) }
      } catch (err) {
        const status = (err as { status?: number })?.status
        if (status === 403 || status === 404) throw new Error(PRIVATE_MESSAGE)
        throw err
      }
    },
    deps: [username, collection],
  })

  const isPrivate = itemsError === PRIVATE_MESSAGE

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: username || 'Perfil' }]} />

      {loadingProfile && <Spinner label="Cargando perfil…" />}

      {profileError && !loadingProfile && (
        <EmptyState
          title="Usuario no encontrado"
          message={profileError}
          action={
            <Link className="btn-primary mt-2" to="/">
              Volver al inicio
            </Link>
          }
        />
      )}

      {!loadingProfile && profile && (
        <>
          <UserProfileHeader profile={profile} />

          <div className="flex flex-wrap gap-2" role="group" aria-label="Colecciones">
            {COLLECTIONS.map(({ key, label }) => {
              const count = profile.publicCollectionCounts?.[key] ?? 0
              const active = collection === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCollection(key)}
                  aria-pressed={active}
                  className={`text-body-sm px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand text-white shadow-brand-glow'
                      : 'text-graphite hover:text-brand hover:bg-brand-soft'
                  }`}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>

          {isPrivate ? (
            <EmptyState title="Colección privada" message="Esta colección es privada." />
          ) : (
            <>
              {itemsError && <ErrorBanner message={itemsError} />}
              {loadingItems ? (
                <SkeletonGrid count={6} />
              ) : items.length === 0 && !itemsError ? (
                <EmptyState title="Sin elementos" message="No hay elementos públicos aquí todavía." />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <article key={item.key} className="card flex gap-4 p-4">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            className="w-16 h-24 object-cover rounded-lg shadow-sm shrink-0 bg-paper"
                          />
                        ) : (
                          <div className="w-16 h-24 rounded-lg shrink-0 bg-brand-soft flex items-center justify-center text-caption text-graphite text-center px-1">
                            Sin imagen
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-heading-sm leading-snug line-clamp-2">{item.title}</h3>
                          {item.subtitle && (
                            <p className="text-caption text-graphite mt-1 line-clamp-1">{item.subtitle}</p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                  {loadingMore && <SkeletonInline />}
                  {!hasMore && items.length > 0 && (
                    <p className="text-body-sm text-graphite text-center" role="status">
                      No hay más elementos
                    </p>
                  )}
                  <div ref={sentinelRef} className="h-px" aria-hidden="true" />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
