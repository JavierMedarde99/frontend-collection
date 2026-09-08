import { Game } from './Game'
import { GamePlatform } from './GamePlatform'
import { GameStatus } from './GameStatus'

export interface PageGameResponse {
  content: Game[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface ListGamesParams {
  page?: number
  size?: number
  sort?: string
  name?: string
  platform?: GamePlatform | ''
  status?: GameStatus | ''
}

export interface GameFormData {
  title: string
  platform: GamePlatform
  status: GameStatus
  thumbnailUrl?: string
  userRating?: number
  comment?: string
  dateAdded?: string
  dateCompleted?: string
  externalSource?: string
  externalId?: string
  obtainPlatinum?: boolean
}

export interface SearchGameResult {
  id: string
  title: string
  description?: string
  genre?: string
  platform?: string
  publisher?: string
  developer?: string
  releaseDate?: string
  thumbnailUrl?: string
  externalSource?: string
}

export interface GameAchievement {
  name: string
  description?: string
  achieved: boolean
  iconUrl?: string
}
