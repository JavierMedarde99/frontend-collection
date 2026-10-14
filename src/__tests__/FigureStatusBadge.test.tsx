import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FigureStatusBadge from '../components/FigureStatusBadge'
import { FunkoStatus } from '../types/Funko'
import { AmiiboStatus } from '../types/Amiibo'

describe('FigureStatusBadge', () => {
  it('muestra "En propiedad" para un FunkoStatus.OWNED', () => {
    render(<FigureStatusBadge status={FunkoStatus.OWNED} />)
    expect(screen.getByText('En propiedad')).toBeInTheDocument()
  })

  it('muestra "Lista de deseos" para un AmiiboStatus.WISHLIST', () => {
    render(<FigureStatusBadge status={AmiiboStatus.WISHLIST} />)
    expect(screen.getByText('Lista de deseos')).toBeInTheDocument()
  })

  it('aplica el color de badge de OWNED', () => {
    const { container } = render(<FigureStatusBadge status={FunkoStatus.OWNED} />)
    expect(container.firstChild).toHaveClass('bg-green-600', 'text-white')
  })

  it('cae al fallback de WISHLIST con un valor desconocido sin romper', () => {
    const { container } = render(<FigureStatusBadge status={'UNKNOWN' as FunkoStatus} />)
    expect(container.firstChild).toHaveClass('bg-yellow-100', 'text-yellow-800')
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
  })
})
