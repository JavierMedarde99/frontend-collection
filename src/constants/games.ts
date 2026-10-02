import { GameStatus } from '../types'

/**
 * La plataforma es texto libre: el backend devuelve lo que le da el catálogo
 * externo ('PlayStation 5', 'Web browser', 'PC (Windows)'), no un enum cerrado.
 * Antes `Game.platform` era el enum GamePlatform de cinco valores.
 */

/**
 * ¿Es una versión de PC? El enum antiguo usaba el string exacto 'PC'. Ahora el
 * nombre viene del catálogo externo y hay varias formas de decir lo mismo:
 * 'PC', 'PC (Windows)', 'Windows' (así lo llama FreeToGame) o 'macOS'.
 * 'PC-Engine' y 'PlayStation' no cuentan: contienen 'PC' pero no son PC.
 */
export function isPcPlatform(platform: string | undefined | null): boolean {
  if (!platform) return false
  const name = platform.trim()
  if (/^pc(\s*\(|$)/i.test(name)) return true
  return /^(windows|mac\s*os|macos|linux)$/i.test(name)
}

/** Alias de los valores que guardó el enum antiguo, para no romperlos. */
const LEGACY_PLATFORM_LABELS: Record<string, string> = {
  WII_U: 'Wii U',
  SWITCH: 'Switch',
}

/** Nombre legible: el que manda es el propio texto, con alias solo para el enum viejo. */
export function platformLabel(platform: string): string {
  return LEGACY_PLATFORM_LABELS[platform] ?? platform
}

/** Colores fijos para las plataformas conocidas (los del enum antiguo). */
const KNOWN_PLATFORM_BADGES: Record<string, string> = {
  PC: 'bg-slate-100 text-slate-700',
  PS2: 'bg-sky-100 text-sky-700',
  PS3: 'bg-indigo-100 text-indigo-700',
  WII_U: 'bg-cyan-100 text-cyan-700',
  SWITCH: 'bg-red-100 text-red-700',
  'PlayStation 2': 'bg-sky-100 text-sky-700',
  'PlayStation 3': 'bg-indigo-100 text-indigo-700',
  'PlayStation 4': 'bg-indigo-100 text-indigo-700',
  'PlayStation 5': 'bg-indigo-100 text-indigo-700',
  'Nintendo Switch': 'bg-red-100 text-red-700',
}

/** Paleta de reserva para las plataformas que aún no tienen color propio. */
const DEFAULT_BADGE = 'bg-stone-100 text-stone-700'

const FALLBACK_BADGES = [
  'bg-slate-100 text-slate-700',
  'bg-sky-100 text-sky-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-red-100 text-red-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-fuchsia-100 text-fuchsia-700',
]

/**
 * Clase de la insignia. Las plataformas conocidas conservan su color; el resto
 * recibe uno de la paleta por hash del nombre, así el color es estable entre
 * renders y no cambia al reordenar la lista.
 */
export function platformBadgeClass(platform: string): string {
  const known = KNOWN_PLATFORM_BADGES[platform]
  if (known) return known
  if (!platform) return DEFAULT_BADGE

  let hash = 0
  for (let i = 0; i < platform.length; i++) {
    hash = (hash * 31 + platform.charCodeAt(i)) | 0
  }
  return FALLBACK_BADGES[Math.abs(hash) % FALLBACK_BADGES.length] ?? DEFAULT_BADGE
}

export const GAME_STATES: Record<GameStatus, string> = {
  [GameStatus.PLAYING]: 'Jugando',
  [GameStatus.COMPLETED]: 'Completado',
  [GameStatus.WISHLIST]: 'Lista de deseos',
  [GameStatus.OWNED]: 'En posesión',
}

export const GAME_STATE_LABELS: Record<GameStatus, string> = GAME_STATES

export const GAME_STATE_COLORS: Record<GameStatus, string> = {
  [GameStatus.PLAYING]: 'bg-action-blue text-white',
  [GameStatus.COMPLETED]: 'bg-green-600 text-white',
  [GameStatus.WISHLIST]: 'bg-yellow-100 text-yellow-800',
  [GameStatus.OWNED]: 'bg-slate-100 text-slate-700',
}

export const GAME_DOT_COLORS: Record<GameStatus, string> = {
  [GameStatus.PLAYING]: 'bg-white',
  [GameStatus.COMPLETED]: 'bg-white',
  [GameStatus.WISHLIST]: 'bg-yellow-500',
  [GameStatus.OWNED]: 'bg-slate-500',
}
