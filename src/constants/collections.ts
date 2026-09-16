export interface CollectionMeta {
  key: 'books' | 'games' | 'magic' | 'decks' | 'boardgames' | 'movieshows'
  label: string
  to: string
}

export const COLLECTIONS: CollectionMeta[] = [
  { key: 'books', label: 'Libros', to: '/coleccion' },
  { key: 'games', label: 'Videojuegos', to: '/juegos' },
  { key: 'magic', label: 'Magic', to: '/magic' },
  { key: 'decks', label: 'Mazos', to: '/magic/mazos' },
  { key: 'boardgames', label: 'Juegos de mesa', to: '/boardgames' },
  { key: 'movieshows', label: 'Películas y series', to: '/movieshows' },
]

/** Clave del backend (mayúsculas) ↔ clave del front. */
export function toBackendCollectionKey(key: string): string {
  return key.toUpperCase()
}

export function fromBackendCollectionKey(key: string): string {
  return key.toLowerCase()
}
