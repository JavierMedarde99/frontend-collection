import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import OwnerTabs from '../components/OwnerTabs'

describe('OwnerTabs', () => {
  it('sin sesión (showMine=false) muestra una sola pestaña "Todas" activa', () => {
    render(<OwnerTabs value="other" onChange={vi.fn()} showMine={false} />)

    const tab = screen.getByRole('tab', { name: 'Todas' })
    expect(tab).toBeInTheDocument()
    expect(tab).toHaveAttribute('aria-selected', 'true')
  })

  it('con sesión muestra "Mi colección" y "Todas"', () => {
    render(<OwnerTabs value="mine" onChange={vi.fn()} showMine={true} />)

    expect(screen.getByRole('tab', { name: 'Mi colección' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Todas' })).toBeInTheDocument()
  })

  it('marca la activa con aria-selected y la clase de filete de acento', () => {
    const { container } = render(<OwnerTabs value="mine" onChange={vi.fn()} showMine={true} />)

    const mine = screen.getByRole('tab', { name: 'Mi colección' })
    const other = screen.getByRole('tab', { name: 'Todas' })
    expect(mine).toHaveAttribute('aria-selected', 'true')
    expect(other).toHaveAttribute('aria-selected', 'false')
    expect(mine.classList.contains('owner-tab--active')).toBe(true)
    expect(other.classList.contains('owner-tab--active')).toBe(false)
    expect(container.querySelector('.filet')).not.toBeNull()
  })

  it('dispara onChange con la clave al pulsar la inactiva', () => {
    const onChange = vi.fn()
    render(<OwnerTabs value="mine" onChange={onChange} showMine={true} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Todas' }))
    expect(onChange).toHaveBeenCalledWith('other')
  })
})