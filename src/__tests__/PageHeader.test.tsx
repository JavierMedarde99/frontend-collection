import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageHeader from '../components/PageHeader'

describe('PageHeader', () => {
  it('renderiza kicker, título y subtítulo', () => {
    render(<PageHeader eyebrow="Libros" title="Colección de libros" subtitle="12 libros en tu colección" />)

    expect(screen.getByText('Libros')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Colección de libros' })).toBeInTheDocument()
    expect(screen.getByText('12 libros en tu colección')).toBeInTheDocument()
  })

  it('incluye la regla doble con su barra de acento', () => {
    const { container } = render(<PageHeader eyebrow="Magic" title="Colección Magic" />)

    expect(container.querySelector('.rule-double')).not.toBeNull()
    expect(container.querySelector('.accent-bar')).not.toBeNull()
  })

  it('no renderiza subtítulo si no se pasa y muestra las acciones', () => {
    const { container } = render(
      <PageHeader eyebrow="Mazos" title="Colección de mazos" actions={<button type="button">Añadir</button>} />,
    )

    expect(container.querySelector('.ph-sub')).toBeNull()
    expect(screen.getByRole('button', { name: 'Añadir' })).toBeInTheDocument()
  })
})