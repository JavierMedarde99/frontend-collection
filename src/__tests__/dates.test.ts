import { describe, expect, it } from 'vitest'
import { missingRequiredDate, todayIso } from '../utils/dates'

describe('todayIso', () => {
  it('devuelve la fecha de hoy en formato YYYY-MM-DD', () => {
    expect(todayIso()).toBe(new Date().toISOString().slice(0, 10))
  })
})

describe('missingRequiredDate', () => {
  it('no da error si la fecha está puesta', () => {
    expect(missingRequiredDate('2024-03-15', 'La fecha de obtención')).toBeNull()
  })

  it('da error si la fecha está vacía', () => {
    expect(missingRequiredDate('', 'La fecha de obtención')).toBe('La fecha de obtención es obligatoria.')
  })

  it('da error si la fecha es undefined', () => {
    expect(missingRequiredDate(undefined, 'La fecha de fin')).toBe('La fecha de fin es obligatoria.')
  })
})
