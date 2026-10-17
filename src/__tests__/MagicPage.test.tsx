import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import MagicPage from '../pages/MagicPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <MagicPage />
    </MemoryRouter>,
  )
}

describe('MagicPage', () => {
  it('muestra la cabecera del hub de Magic', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Magic' })).toBeInTheDocument()
    expect(document.title).toBe('Magic — Collection')
  })

  it('enlaza a Cartas y Mazos con sus destinos', () => {
    renderPage()

    const cartas = screen.getByRole('link', { name: /Cartas/ })
    expect(cartas).toHaveAttribute('href', '/magic/cartas')

    const mazos = screen.getByRole('link', { name: /Mazos/ })
    expect(mazos).toHaveAttribute('href', '/magic/mazos')
  })
})
