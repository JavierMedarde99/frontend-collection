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

function renderCard(amiibo: Amiibo, props: { readOnly?: boolean; onDelete?: () => Promise<void> } = {}) {
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

  it('enlaza la tarjeta al detalle de la pieza', () => {
    renderCard(amiiboWith())

    const links = screen.getAllByRole('link', { name: 'Mario' })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/figuras/amiibo/a1')
    }
  })

  it('muestra el menú de acciones cuando es editable y hay onDelete', () => {
    renderCard(amiiboWith(), { onDelete: async () => {} })

    expect(screen.getByLabelText('Acciones para Mario')).toBeInTheDocument()
  })

  it('no muestra el menú de acciones en modo solo lectura', () => {
    renderCard(amiiboWith({ userOwned: { username: 'otro' } }), { readOnly: true, onDelete: async () => {} })

    expect(screen.queryByLabelText('Acciones para Mario')).toBeNull()
  })
})
