import { GamePlatform } from './GamePlatform'
import { GameStatus } from './GameStatus'

export interface Game {
  id: string
  externalId?: string
  title: string
  platform: GamePlatform
  thumbnailUrl?: string
  status: GameStatus
  userRating?: number
  comment?: string
  dateAdded?: string
  dateCompleted?: string
  externalSource?: string
}
