import { GamePlatform } from './GamePlatform'
import { GameStatus } from './GameStatus'
import type { UserOwned } from './Api'

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
  steamAppId?: string
  obtainPlatinum?: boolean
  userOwned?: UserOwned | null
}
