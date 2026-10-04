import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MetaList from '../components/MetaList'

describe('MetaList', () => {
  it('renderiza las parejas label/valor', () => {
    render(
      <MetaList
        items={[
          { label: 'Editorial', value: 'Planeta' },
          { label: 'Año', value: 2018 },
        ]}
      />,
    )

    expect(screen.getByText('Editorial')).toBeInTheDocument()
    expect(screen.getByText('Planeta')).toBeInTheDocument()
    expect(screen.getByText('Año')).toBeInTheDocument()
    expect(screen.getByText('2018')).toBeInTheDocument()
  })

  it('aplica la clase de columnas (cols-3 / cols-2)', () => {
    const { container } = render(
      <MetaList columns={3} items={[{ label: 'A', value: '1' }, { label: 'B', value: '2' }]} />,
    )
    expect(container.querySelector('.meta-list.cols-3')).not.toBeNull()

    const { container: container2 } = render(
      <MetaList columns={2} items={[{ label: 'A', value: '1' }]} />,
    )
    expect(container2.querySelector('.meta-list.cols-2')).not.toBeNull()
  })
})