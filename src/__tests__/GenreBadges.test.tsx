import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GenreBadges from '../components/GenreBadges'

describe('GenreBadges', () => {
  it('muestra un tag por género', () => {
    render(<GenreBadges genres={['Fantasía', 'Terror']} />)
    expect(screen.getByText('Fantasía')).toBeInTheDocument()
    expect(screen.getByText('Terror')).toBeInTheDocument()
  })

  it('sin géneros no renderiza nada', () => {
    const { container } = render(<GenreBadges genres={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('sin prop no renderiza nada', () => {
    const { container } = render(<GenreBadges genres={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('con max solo muestra los primeros', () => {
    render(<GenreBadges genres={['Fantasía', 'Terror', 'Misterio']} max={1} />)
    expect(screen.getByText('Fantasía')).toBeInTheDocument()
    expect(screen.queryByText('Terror')).not.toBeInTheDocument()
    expect(screen.queryByText('Misterio')).not.toBeInTheDocument()
  })
})
