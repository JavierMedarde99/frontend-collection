import { describe, expect, it } from 'vitest'
import { isPcPlatform, platformBadgeClass, platformLabel } from '../constants/games'

describe('isPcPlatform', () => {
  it('reconoce el nombre exacto del enum', () => {
    expect(isPcPlatform('PC')).toBe(true)
  })

  it('reconoce el nombre que devuelve FreeToGame', () => {
    expect(isPcPlatform('PC (Windows)')).toBe(true)
    expect(isPcPlatform('Windows')).toBe(true)
    expect(isPcPlatform('macOS')).toBe(true)
  })

  it('no confunde consolas con PC', () => {
    expect(isPcPlatform('PlayStation 5')).toBe(false)
    expect(isPcPlatform('Nintendo Switch')).toBe(false)
    expect(isPcPlatform('PC-Engine')).toBe(false)
    expect(isPcPlatform('Xbox Series X')).toBe(false)
  })

  it('es falso con vacío o undefined', () => {
    expect(isPcPlatform('')).toBe(false)
    expect(isPcPlatform(undefined)).toBe(false)
  })
})

describe('platformLabel', () => {
  it('devuelve el nombre tal cual cuando no hay alias conocido', () => {
    expect(platformLabel('PlayStation 5')).toBe('PlayStation 5')
  })

  it('mantiene el alias de los valores guardados por el enum antiguo', () => {
    expect(platformLabel('SWITCH')).toBe('Switch')
    expect(platformLabel('WII_U')).toBe('Wii U')
  })
})

describe('platformBadgeClass', () => {
  it('devuelve una clase para cualquier plataforma', () => {
    expect(platformBadgeClass('PlayStation 5')).toBeTruthy()
  })

  it('es estable para la misma plataforma', () => {
    expect(platformBadgeClass('PlayStation 5')).toBe(platformBadgeClass('PlayStation 5'))
  })

  it('mantiene los colores del enum para los valores conocidos', () => {
    expect(platformBadgeClass('PC')).toContain('slate')
    expect(platformBadgeClass('SWITCH')).toContain('red')
  })
})