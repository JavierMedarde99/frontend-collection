import { GameStatus } from './GameStatus'
import type { UserOwned } from './Api'

export interface Game {
  id: string
  externalId?: string
  title: string
  platform: string
  thumbnailUrl?: string
  status: GameStatus
  userRating?: number
  comment?: string
  dateAdded?: string
  dateCompleted?: string
  externalSource?: string
  steamAppId?: string
  obtainPlatinum?: boolean
  acquisitionDate?: string
  acquisitionPrice?: number
  genres?: string[]
  userOwned?: UserOwned | null
  /** Id local del juego base del que es contenido adicional. Inmutable tras el alta. */
  parentId?: string
  /** Título del base, desnormalizado para pintar «Contenido adicional de …» sin N+1. */
  parentTitle?: string
}

/** Filtro de listado `GET /games?type=base|dlc|all`. */
export type GameTypeFilter = 'base' | 'dlc' | 'all'

/** Adición del catálogo de RAWG con los flags calculados para el espectador. */
export interface GameAddition {
  externalId: string
  title: string
  platform?: string
  genres: string[]
  thumbnailUrl?: string
  releaseDate?: string
  externalSource?: string
  /** El espectador ya tiene un juego con ese externalId, suelto o vinculado. */
  inCollection: boolean
  /** Ese juego ya cuelga de este mismo base. */
  alreadyLinked: boolean
}

/** Respuesta de `GET /games/{id}/additions`. */
export interface GameAdditionList {
  baseGameId: string
  baseExternalId?: string
  additions: GameAddition[]
  totalAvailable: number
}

/** Respuesta de `POST /games/{id}/additions` (idempotente). */
export interface AddGameAdditionsResponse {
  created: Game[]
  linked: Game[]
  skipped: { externalId: string; reason: string }[]
}
