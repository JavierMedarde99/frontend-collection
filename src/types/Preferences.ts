export type CollectionType = 'books' | 'games' | 'magic' | 'decks' | 'boardgames' | 'movieshows'

export type CollectionVisibility = 'PUBLIC' | 'PRIVATE'

export interface UserPreferences {
  id: string
  userId: string
  activeCollections: Record<string, boolean>
  collectionVisibility: Record<string, CollectionVisibility>
  createdAt?: string
  updatedAt?: string
}

export interface UserPreferencesRequest {
  activeCollections: Record<string, boolean>
  collectionVisibility: Record<string, CollectionVisibility>
}

export interface ActiveCollectionsRequest {
  collections: Record<string, boolean>
}

export interface CollectionVisibilityRequest {
  visibility: Record<string, CollectionVisibility>
}

export interface PublicProfileResponse {
  username: string
  displayName?: string | null
  avatarUrl?: string | null
  bio?: string | null
  publicCollectionCounts?: Record<string, number> | null
}
