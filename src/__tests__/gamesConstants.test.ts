import { describe, expect, it } from 'vitest'
import { GAME_STATE_COLORS, GAME_STATE_LABELS, GAME_DOT_COLORS, GAME_STATES } from '../constants/games'
import { GameStatus } from '../types/GameStatus'

describe('estados de videojuegos', () => {
  it('el contrato del backend usa OWNED en vez de ABANDONED', () => {
    expect(GameStatus.OWNED).toBe('OWNED')
    const statuses = GameStatus as unknown as Record<string, string | undefined>
    expect(statuses.ABANDONED).toBeUndefined()
  })

  it('GAME_STATES traduce los 4 estados', () => {
    expect(GAME_STATES[GameStatus.OWNED]).toBe('En posesión')
    expect(GAME_STATES[GameStatus.PLAYING]).toBe('Jugando')
    expect(GAME_STATES[GameStatus.COMPLETED]).toBe('Completado')
    expect(GAME_STATES[GameStatus.WISHLIST]).toBe('Lista de deseos')
  })

  it('OWNED tiene color de badge y de punto propios, distintos de COMPLETED', () => {
    expect(GAME_STATE_COLORS[GameStatus.OWNED]).toBe('bg-slate-100 text-slate-700')
    expect(GAME_STATE_COLORS[GameStatus.OWNED]).not.toBe(GAME_STATE_COLORS[GameStatus.COMPLETED])
    expect(GAME_DOT_COLORS[GameStatus.OWNED]).toBe('bg-slate-500')
    expect(GAME_STATE_LABELS[GameStatus.OWNED]).toBe('En posesión')
  })
})