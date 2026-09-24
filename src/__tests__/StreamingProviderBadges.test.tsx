import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StreamingProviderBadges from '../components/StreamingProviderBadges'

const providers = [
  { providerId: 8, providerName: 'Netflix', logoUrl: 'https://img/n.jpg', type: 'FLATRATE', deepLinkUrl: 'https://www.netflix.com/search?q=Dune' },
  { providerId: 10, providerName: 'Amazon Video', logoUrl: 'https://img/a.jpg', type: 'BUY' },
]

describe('StreamingProviderBadges', () => {
  it('agrupa por tipo aunque el backend lo mande en mayúsculas', () => {
    render(<StreamingProviderBadges providers={providers} />)
    expect(screen.getByText('Suscripción')).toBeInTheDocument()
    expect(screen.getByText('Compra')).toBeInTheDocument()
    expect(screen.queryByText('Otras')).not.toBeInTheDocument()
  })

  it('enlaza cada logo con su propia url', () => {
    render(<StreamingProviderBadges providers={providers} />)
    expect(screen.getByRole('link', { name: 'Netflix' })).toHaveAttribute('href', 'https://www.netflix.com/search?q=Dune')
    expect(screen.queryByRole('link', { name: 'Amazon Video' })).not.toBeInTheDocument()
  })

  it('lista vacía no renderiza nada', () => {
    const { container } = render(<StreamingProviderBadges providers={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
