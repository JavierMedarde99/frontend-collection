import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FilterPill from '../components/FilterPill'

describe('FilterPill', () => {
  it('activa: aria-pressed true y clase de relleno de acento', () => {
    const { container } = render(
      <FilterPill active onClick={vi.fn()} label="En progreso">
        En progreso
      </FilterPill>,
    )

    const pill = screen.getByRole('button', { name: 'En progreso' })
    expect(pill).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('.filter-pill--active')).not.toBeNull()
  })

  it('inactiva: aria-pressed false y sin clase de relleno', () => {
    const { container } = render(
      <FilterPill active={false} onClick={vi.fn()} label="Completados">
        Completados
      </FilterPill>,
    )

    const pill = screen.getByRole('button', { name: 'Completados' })
    expect(pill).toHaveAttribute('aria-pressed', 'false')
    expect(container.querySelector('.filter-pill--active')).toBeNull()
  })

  it('dispara onClick', () => {
    const onClick = vi.fn()
    render(
      <FilterPill active={false} onClick={onClick} label="Todos">
        Todos
      </FilterPill>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})