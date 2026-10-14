import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import FunkoCard from '../components/FunkoCard'
import { FunkoStatus } from '../types'
import type { Funko } from '../types'

function funkoWith(overrides: Partial<Funko> = {}): Funko {
  return {
    id: 'f1',
    externalId: 'ext-1',
    name: 'Spider-Man',
    series: 'Marvel',
    number: '123',
    status: FunkoStatus.OWNED,
    ...overrides,
  }
}

function renderCard(funko: Funko, props: { readOnly?: boolean } = {}) {
  return render(
    <MemoryRouter>
      <FunkoCard funko={funko} {...props} />
    </MemoryRouter>,
  )
}

describe('FunkoCard', () => {
  it('muestra el nombre y el estado', () => {
    renderCard(funkoWith())

    expect(screen.getByText('Spider-Man')).toBeInTheDocument()
    expect(screen.getByText('En propiedad')).toBeInTheDocument()
  })

  it('no rompe cuando no hay notas', () => {
    renderCard(funkoWith({ notes: undefined }))

    expect(screen.getByText('Spider-Man')).toBeInTheDocument()
    expect(screen.queryByText('Caja perfecta')).toBeNull()
  })

  it('muestra las notas cuando existen', () => {
    renderCard(funkoWith({ notes: 'Caja perfecta' }))

    expect(screen.getByText('Caja perfecta')).toBeInTheDocument()
  })

  it('muestra el fallback cuando no hay imagen', () => {
    renderCard(funkoWith({ imageUrl: undefined }))

    expect(screen.getByText('Sin imagen')).toBeInTheDocument()
  })

  it('readOnly no altera el contenido visible', () => {
    const { unmount } = renderCard(funkoWith(), { readOnly: false })
    expect(screen.getByText('Spider-Man')).toBeInTheDocument()
    expect(screen.getByText('En propiedad')).toBeInTheDocument()
    unmount()

    renderCard(funkoWith(), { readOnly: true })
    expect(screen.getByText('Spider-Man')).toBeInTheDocument()
    expect(screen.getByText('En propiedad')).toBeInTheDocument()
  })
})
