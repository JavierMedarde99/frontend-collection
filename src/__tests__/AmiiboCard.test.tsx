import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AmiiboCard from '../components/AmiiboCard'
import { AmiiboStatus, AmiiboType } from '../types'
import type { Amiibo } from '../types'

function amiiboWith(overrides: Partial<Amiibo> = {}): Amiibo {
  return {
    id: 'a1',
    externalId: 'ext-a1',
    name: 'Mario',
    character: 'Mario',
    amiiboSeries: 'Super Smash Bros.',
    gameSeries: 'Super Mario',
    amiiboType: AmiiboType.FIGURE,
    status: AmiiboStatus.OWNED,
    ...overrides,
  }
}

function renderCard(amiibo: Amiibo, props: { readOnly?: boolean } = {}) {
  return render(
    <MemoryRouter>
      <AmiiboCard amiibo={amiibo} {...props} />
    </MemoryRouter>,
  )
}

describe('AmiiboCard', () => {
  it('muestra el nombre y el estado', () => {
    renderCard(amiiboWith())

    expect(screen.getByRole('heading', { name: 'Mario' })).toBeInTheDocument()
    expect(screen.getByText('Mario', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('En propiedad')).toBeInTheDocument()
  })

  it('traduce un amiiboType conocido', () => {
    renderCard(amiiboWith({ amiiboType: AmiiboType.FIGURE }))

    expect(screen.getByText('Figura')).toBeInTheDocument()
  })

  it('no rompe cuando no hay fechas de lanzamiento', () => {
    renderCard(amiiboWith({ releaseDates: undefined }))

    expect(screen.getByRole('heading', { name: 'Mario' })).toBeInTheDocument()
  })

  it('muestra las fechas de lanzamiento cuando existen', () => {
    renderCard(amiiboWith({ releaseDates: { na: '2014-11-21', eu: '2014-11-28' } }))

    expect(screen.getByText(/2014-11-21/)).toBeInTheDocument()
  })

  it('muestra el fallback cuando no hay imagen', () => {
    renderCard(amiiboWith({ imageUrl: undefined }))

    expect(screen.getByText('Sin imagen')).toBeInTheDocument()
  })
})
