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
  results: MagicCardSearchResult[]
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

export interface ListMagicCardsParams {
  page?: number
  size?: number
  sort?: string
  name?: string
  rarity?: string
  color?: string
  type?: string
}
