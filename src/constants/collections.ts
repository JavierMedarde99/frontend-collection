export type CollectionKey = 'books' | 'games' | 'magic' | 'decks' | 'boardgames' | 'movieshows'

export interface CollectionMeta {
  key: CollectionKey
  label: string
  /** Nombre corto grabado (vitrina, migas, colofones). */
  nick: string
  to: string
  /** Acento Gabinete por colección: spine → --sc, niche → --c. */
  accent: { spine: string; niche: string }
  /** Número de catálogo impreso en cabeceras y colofones. */
  catalogNo: string
}

export const COLLECTIONS: CollectionMeta[] = [
  { key: 'books', label: 'Libros', nick: 'Libros', to: '/coleccion', accent: { spine: '#c2410c', niche: '#e8633a' }, catalogNo: '02' },
  { key: 'games', label: 'Videojuegos', nick: 'Videojuegos', to: '/juegos', accent: { spine: '#b45309', niche: '#ee9b2e' }, catalogNo: '03' },
  { key: 'magic', label: 'Magic', nick: 'Magic', to: '/magic', accent: { spine: '#8f3a1e', niche: '#c96a3e' }, catalogNo: '04' },
  { key: 'decks', label: 'Mazos', nick: 'Mazos', to: '/magic/mazos', accent: { spine: '#92600a', niche: '#b8862f' }, catalogNo: '04-B' },
  { key: 'boardgames', label: 'Juegos de mesa', nick: 'Mesa', to: '/boardgames', accent: { spine: '#6d4a2a', niche: '#a5783f' }, catalogNo: '05' },
  { key: 'movieshows', label: 'Películas y series', nick: 'Cine', to: '/movieshows', accent: { spine: '#77613a', niche: '#a08b52' }, catalogNo: '06' },
]

export const COLLECTIONS_BY_KEY: Record<CollectionKey, CollectionMeta> = Object.fromEntries(
  COLLECTIONS.map((c) => [c.key, c]),
) as Record<CollectionKey, CollectionMeta>

/** Clave del backend (mayúsculas) ↔ clave del front. */
export function toBackendCollectionKey(key: string): string {
  return key.toUpperCase()
}

export function fromBackendCollectionKey(key: string): string {
  return key.toLowerCase()
}