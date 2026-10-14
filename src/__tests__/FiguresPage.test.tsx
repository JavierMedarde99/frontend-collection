import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import FiguresPage from '../pages/FiguresPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <FiguresPage />
    </MemoryRouter>,
  )
}

describe('FiguresPage', () => {
  it('muestra la cabecera del hub de Figuras', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Figuras' })).toBeInTheDocument()
    expect(document.title).toBe('Figuras — Collection')
  })

  it('enlaza a las dos subpáginas con sus títulos', () => {
    renderPage()

    const funko = screen.getByRole('link', { name: /Funko Pop/ })
    expect(funko).toHaveAttribute('href', '/figuras/funkopop')

    const amiibo = screen.getByRole('link', { name: /Amiibo/ })
    expect(amiibo).toHaveAttribute('href', '/figuras/amiibo')
  })
})
