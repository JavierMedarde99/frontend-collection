import { Game } from './Game'
import { GameStatus } from './GameStatus'

/** Entrada de GET /api/v1/games/platforms. */
export interface PlatformInfo {
  id: number
  name: string
  slug?: string
}

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
  platform?: string
  status?: GameStatus | ''
  genre?: string[]
  owner?: 'mine' | 'other' | ''
  viewerId?: string
}

export interface GameFormData {
  title: string
  platform: string
  status: GameStatus
  thumbnailUrl?: string
  userRating?: number
  comment?: string
  dateAdded?: string
  dateCompleted?: string
  externalSource?: string
  externalId?: string
  obtainPlatinum?: boolean
  steamAppId?: string
  genres?: string[]
  acquisitionDate?: string
  acquisitionPrice?: number | ''
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

export interface PageGameSearchResult {
  content: SearchGameResult[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface GameAchievement {
  name: string
  description?: string
  achieved: boolean
  iconUrl?: string
}

export interface GameAchievementsResponse {
  achievements: GameAchievement[]
  totalAchievements: number
  totalAchieved: number
  percentage: number
}
