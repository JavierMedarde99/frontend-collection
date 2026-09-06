import { GamePlatform, GameStatus } from '../types'

export const GAME_PLATFORMS: Record<GamePlatform, string> = {
  [GamePlatform.PC]: 'PC',
  [GamePlatform.PS2]: 'PS2',
  [GamePlatform.PS3]: 'PS3',
  [GamePlatform.WII_U]: 'Wii U',
  [GamePlatform.SWITCH]: 'Switch',
}

export const PLATFORM_LABELS: Record<GamePlatform, string> = GAME_PLATFORMS

export const PLATFORM_BADGE_COLORS: Record<GamePlatform, string> = {
  [GamePlatform.PC]: 'bg-slate-100 text-slate-700',
  [GamePlatform.PS2]: 'bg-sky-100 text-sky-700',
  [GamePlatform.PS3]: 'bg-indigo-100 text-indigo-700',
  [GamePlatform.WII_U]: 'bg-cyan-100 text-cyan-700',
  [GamePlatform.SWITCH]: 'bg-red-100 text-red-700',
}

export const GAME_STATES: Record<GameStatus, string> = {
  [GameStatus.PLAYING]: 'Jugando',
  [GameStatus.COMPLETED]: 'Completado',
  [GameStatus.WISHLIST]: 'Lista de deseos',
  [GameStatus.ABANDONED]: 'Abandonado',
}

export const GAME_STATE_LABELS: Record<GameStatus, string> = GAME_STATES

export const GAME_STATE_COLORS: Record<GameStatus, string> = {
  [GameStatus.PLAYING]: 'bg-action-blue text-white',
  [GameStatus.COMPLETED]: 'bg-green-600 text-white',
  [GameStatus.WISHLIST]: 'bg-yellow-100 text-yellow-800',
  [GameStatus.ABANDONED]: 'bg-red-100 text-red-700',
}

export const GAME_DOT_COLORS: Record<GameStatus, string> = {
  [GameStatus.PLAYING]: 'bg-white',
  [GameStatus.COMPLETED]: 'bg-white',
  [GameStatus.WISHLIST]: 'bg-yellow-500',
  [GameStatus.ABANDONED]: 'bg-red-500',
}
