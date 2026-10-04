import { describe, expect, it } from 'vitest'
import {
  COLLECTIONS,
  COLLECTIONS_BY_KEY,
  fromBackendCollectionKey,
  toBackendCollectionKey,
} from '../constants/collections'

describe('COLLECTIONS — identidad por colección', () => {
  it('define las 6 colecciones con sus claves y rutas', () => {
    expect(COLLECTIONS).toHaveLength(6)
    expect(COLLECTIONS.map((c) => c.key)).toEqual([
      'books',
      'games',
      'magic',
      'decks',
      'boardgames',
      'movieshows',
    ])
    expect(COLLECTIONS_BY_KEY.books.to).toBe('/coleccion')
    expect(COLLECTIONS_BY_KEY.decks.to).toBe('/magic/mazos')
  })

  it('lleva acento spine/niche y catálogo por colección (spec §3)', () => {
    expect(COLLECTIONS_BY_KEY.books).toMatchObject({
      label: 'Libros',
      nick: 'Libros',
      accent: { spine: '#c2410c', niche: '#e8633a' },
      catalogNo: '02',
    })
    expect(COLLECTIONS_BY_KEY.games).toMatchObject({
      label: 'Videojuegos',
      nick: 'Videojuegos',
      accent: { spine: '#b45309', niche: '#ee9b2e' },
      catalogNo: '03',
    })
    expect(COLLECTIONS_BY_KEY.magic).toMatchObject({
      label: 'Magic',
      nick: 'Magic',
      accent: { spine: '#8f3a1e', niche: '#c96a3e' },
      catalogNo: '04',
    })
    expect(COLLECTIONS_BY_KEY.decks).toMatchObject({
      label: 'Mazos',
      nick: 'Mazos',
      accent: { spine: '#92600a', niche: '#b8862f' },
      catalogNo: '04-B',
    })
    expect(COLLECTIONS_BY_KEY.boardgames).toMatchObject({
      label: 'Juegos de mesa',
      nick: 'Mesa',
      accent: { spine: '#6d4a2a', niche: '#a5783f' },
      catalogNo: '05',
    })
    expect(COLLECTIONS_BY_KEY.movieshows).toMatchObject({
      label: 'Películas y series',
      nick: 'Cine',
      accent: { spine: '#77613a', niche: '#a08b52' },
      catalogNo: '06',
    })
  })

  it('mapea claves front ↔ backend', () => {
    expect(toBackendCollectionKey('decks')).toBe('DECKS')
    expect(fromBackendCollectionKey('DECKS')).toBe('decks')
    expect(toBackendCollectionKey('movieshows')).toBe('MOVIESHOWS')
  })
})