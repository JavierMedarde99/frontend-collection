import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { BookState } from '../types/BookState'

function probe(pages?: number, pagesRead?: number, state?: BookState) {
  let result!: ReturnType<typeof useReadingProgress>
  function Probe() {
    result = useReadingProgress(pages, pagesRead, state)
    return null
  }
  render(<Probe />)
  return result
}

describe('useReadingProgress', () => {
  it('sin páginas devuelve ceros y no visible', () => {
    const r = probe(undefined, undefined, BookState.READING)
    expect(r).toMatchObject({ percent: 0, pagesLeft: 0, isVisible: false, read: 0, total: 0 })
  })

  it('pages=0 evita división por cero', () => {
    const r = probe(0, 0, BookState.READING)
    expect(r.percent).toBe(0)
    expect(r.isVisible).toBe(false)
  })

  it('READING a la mitad calcula 50% y 50 restantes', () => {
    const r = probe(100, 50, BookState.READING)
    expect(r).toMatchObject({ percent: 50, pagesLeft: 50, isVisible: true })
  })

  it('READING sin empezar muestra 0% visible', () => {
    const r = probe(100, 0, BookState.READING)
    expect(r).toMatchObject({ percent: 0, isVisible: true })
  })

  it('READING terminado muestra 100% y 0 restantes', () => {
    const r = probe(100, 100, BookState.READING)
    expect(r).toMatchObject({ percent: 100, pagesLeft: 0, isVisible: true })
  })

  it('TO_READ y COMPLETED nunca visibles', () => {
    expect(probe(100, 50, BookState.TO_READ).isVisible).toBe(false)
    expect(probe(100, 50, BookState.COMPLETED).isVisible).toBe(false)
  })

  it('pagesRead > pages calcula sin clampear', () => {
    const r = probe(100, 150, BookState.READING)
    expect(r.percent).toBe(150)
    expect(r.pagesLeft).toBe(0)
  })
})
