import type { DeckStatus } from '../types'

export const MANA_COLORS = {
  W: 'Blanco',
  U: 'Azul',
  B: 'Negro',
  R: 'Rojo',
  G: 'Verde',
} as const

export type ManaColorCode = keyof typeof MANA_COLORS

export const MANA_COLOR_OPTIONS: { value: ManaColorCode; label: string }[] = (
  Object.entries(MANA_COLORS) as [ManaColorCode, string][]
).map(([value, label]) => ({ value, label }))

export const DECK_STATUS_LABELS: Record<DeckStatus, string> = {
  DRAFT: 'Borrador',
  COMPLETE: 'Completo',
  INVALID: 'Inválido',
}

export const DECK_STATUS_COLORS: Record<DeckStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  COMPLETE: 'bg-emerald-100 text-emerald-700',
  INVALID: 'bg-red-100 text-red-700',
}
