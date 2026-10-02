import type { UserOwned } from './Api'

export type MagicLanguage = 'ENGLISH' | 'SPANISH' | 'FRENCH' | 'GERMAN' | 'ITALIAN' | 'PORTUGUESE' | 'JAPANESE' | 'CHINESE'

export type MagicCondition = 'MINT' | 'NEAR_MINT' | 'EXCELLENT' | 'GOOD' | 'PLAYED' | 'POOR'

export interface MagicCardResponse {
  id: string
  scryfallId?: string
  oracleId?: string
  name: string
  language?: MagicLanguage
  releaseDate?: string
  manaCost?: string
  convertedManaCost?: number
  type?: string
  text?: string
  power?: string
  toughness?: string
  loyalty?: string
  colors?: string[]
  colorIdentity?: string[]
  keywords?: string[]
  rarity?: string
  setCode?: string
  setName?: string
  artist?: string
  frame?: string
  borderColor?: string
  layout?: string
  legalities?: Record<string, string>
  priceUsd?: string
  priceEur?: string
  imageUrl?: string
  imageLargeUrl?: string
  artCropUrl?: string
  condition?: MagicCondition
  isFoil?: boolean
  quantity?: number
  notes?: string
  dateAdded?: string
  userOwned?: UserOwned | null
}

export interface MagicCardRequest {
  name: string
  language?: MagicLanguage
  releaseDate?: string
  manaCost?: string
  convertedManaCost?: number
  type?: string
  text?: string
  power?: string
  toughness?: string
  loyalty?: string
  colors?: string[]
  colorIdentity?: string[]
  keywords?: string[]
  rarity?: string
  setCode?: string
  setName?: string
  artist?: string
  frame?: string
  borderColor?: string
  layout?: string
  legalities?: Record<string, string>
  priceUsd?: string
  priceEur?: string
  imageUrl?: string
  imageLargeUrl?: string
  artCropUrl?: string
  condition?: MagicCondition
  isFoil?: boolean
  quantity?: number
  notes?: string
}

export interface MagicCardSearchResult {
  scryfallId: string
  name: string
  manaCost?: string
  type?: string
  rarity?: string
  setCode?: string
  setName?: string
  imageUrl?: string
  imageLargeUrl?: string
  priceUsd?: string
  priceEur?: string
  artist?: string
  text?: string
  power?: string
  toughness?: string
  loyalty?: string
  colors?: string[]
  colorIdentity?: string[]
  keywords?: string[]
  frame?: string
  borderColor?: string
  layout?: string
  legalities?: Record<string, string>
}

export interface MagicCardSearchResponse {
  query: string
  /** El backend pagina los resultados: antes era un array directo. */
  results: MagicCardSearchResult[] | PageMagicCardSearchResult
}

export interface PageMagicCardSearchResult {
  content: MagicCardSearchResult[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface PageMagicCardResponse {
  content: MagicCardResponse[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
}

/**
 * Una impresión concreta de una carta (Scryfall). El `scryfallId` es el que
 * hay que pasar a POST /api/v1/magic/scryfall/{id} para guardar ESA impresión.
 */
export interface MagicCardPrinting {
  scryfallId: string
  name: string
  set: string
  setName: string
  collectorNumber: string
  rarity: string
  artist: string
  releasedAt: string
  lang: string
  imageUrl: string
  artCropUrl: string
  finishes: string[]
  fullArt: boolean
  promoTypes: string[]
  frameEffects: string[]
  borderColor: string
  priceUsd: string
  priceEur: string
}

/** Página de impresiones (backend: 175 por página, Scryfall ignora page_size). */
export interface PageMagicCardPrinting {
  content: MagicCardPrinting[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface ListMagicCardsParams {
  page?: number
  size?: number
  sort?: string
  name?: string
  rarity?: string
  color?: string
  type?: string
  owner?: 'mine' | 'other' | ''
  viewerId?: string
}
