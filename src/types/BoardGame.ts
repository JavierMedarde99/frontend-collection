import type { UserOwned } from './Api'

export enum BoardGameStatus {
  OWNED = 'OWNED',
  WISHLIST = 'WISHLIST',
}

export interface BoardGame {
  id: string
  title: string
  description?: string
  yearPublished?: number
  minPlayers?: number
  maxPlayers?: number
  minPlaytime?: number
  maxPlaytime?: number
  publisher?: string
  designers?: string[]
  categories?: string[]
  mechanics?: string[]
  imageUrl?: string
  thumbnailUrl?: string
  bggRating?: number
  bggId?: string
  status: BoardGameStatus
  notes?: string
  dateAdded?: string
  genres?: string[]
  userOwned?: UserOwned | null
}

export interface BoardGameFormData {
  title: string
  description?: string
  yearPublished?: number
  minPlayers?: number
  maxPlayers?: number
  minPlaytime?: number
  maxPlaytime?: number
  publisher?: string
  designers?: string[]
  categories?: string[]
  mechanics?: string[]
  imageUrl?: string
  thumbnailUrl?: string
  bggRating?: number
  bggId?: string
  status: BoardGameStatus
  notes?: string
  dateAdded?: string
  genres?: string[]
}

export interface BoardGameSearchResult {
  bggId?: string
  title: string
  description?: string
  yearPublished?: number
  minPlayers?: number
  maxPlayers?: number
  minPlaytime?: number
  maxPlaytime?: number
  publisher?: string
  designers?: string[]
  categories?: string[]
  mechanics?: string[]
  imageUrl?: string
  thumbnailUrl?: string
  bggRating?: number
  externalSource?: string
}

export interface BoardGameSearchResponse {
  query: string
  /** El backend pagina los resultados: antes era un array directo. */
  results: BoardGameSearchResult[] | PageBoardGameSearchResult
}

export interface PageBoardGameSearchResult {
  content: BoardGameSearchResult[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface PageBoardGameResponse {
  content: BoardGame[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface ListBoardGamesParams {
  page?: number
  size?: number
  sort?: string
  name?: string
  status?: BoardGameStatus | ''
  genre?: string[]
  owner?: 'mine' | 'other' | ''
  viewerId?: string
}
