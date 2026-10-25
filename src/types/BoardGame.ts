import type { UserOwned } from './Api'

export enum BoardGameStatus {
  OWNED = 'OWNED',
  WISHLIST = 'WISHLIST',
}

export enum BoardGameDifficulty {
  VERY_EASY = 'VERY_EASY',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
}

/**
 * Tipo BGG de un registro (vocabulario del XML de BoardGameGeek). Los
 * registros antiguos no traen `bggType` y se consideran juego base.
 */
export type BoardGameType = 'boardgame' | 'boardgameexpansion'

/** Filtro de listado `GET /boardgames?type=base|expansion|all`. */
export type BoardGameTypeFilter = 'base' | 'expansion' | 'all'

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
  personalRating?: number
  playCount?: number
  lastPlayedDate?: string
  difficulty?: BoardGameDifficulty
  userOwned?: UserOwned | null
  acquisitionPrice?: number
  /** `null`/ausente en los registros antiguos = juego base. */
  bggType?: BoardGameType
  /** Id local del juego base del que es expansión. Inmutable tras el alta. */
  parentId?: string
  /** Título del base, desnormalizado para pintar «Expansión de …» sin N+1. */
  parentTitle?: string
}

/** Expansión del catálogo de BGG con el flag de si el espectador ya la tiene. */
export interface BoardGameExpansion {
  bggId: string
  title: string
  yearPublished?: number
  imageUrl?: string
  thumbnailUrl?: string
  inCollection: boolean
}

/** Respuesta de `GET /boardgames/{id}/expansions`. */
export interface BoardGameExpansionList {
  baseGameId: string
  baseBggId?: string
  expansions: BoardGameExpansion[]
}

/** Respuesta de `POST /boardgames/{id}/expansions` (idempotente). */
export interface AddExpansionsResponse {
  created: BoardGame[]
  skipped: { bggId: string; reason: string }[]
}

/**
 * Expansión a dar de alta en `POST /boardgames/{id}/expansions` con el estado en
 * el que nace: en posesión (OWNED) con su precio y fecha; deseada (WISHLIST) sin
 * datos de adquisición.
 */
export interface AddExpansionItem {
  bggId: string
  status: BoardGameStatus
  acquisitionPrice?: number
  dateAdded?: string
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
  personalRating?: number
  playCount?: number
  lastPlayedDate?: string
  difficulty?: BoardGameDifficulty
  acquisitionPrice?: number
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
  owner?: 'mine' | 'other' | 'all' | ''
  viewerId?: string
  type?: BoardGameTypeFilter | ''
}
