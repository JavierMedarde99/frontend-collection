import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GameStatusBadge from '../components/GameStatusBadge'
import { GameStatus } from '../types/GameStatus'

describe('GameStatusBadge', () => {
  it('muestra "En posesión" para el estado OWNED', () => {
    render(<GameStatusBadge status={GameStatus.OWNED} />)
    expect(screen.getByText('En posesión')).toBeInTheDocument()
  })

  it('aplica el color de badge de OWNED', () => {
    const { container } = render(<GameStatusBadge status={GameStatus.OWNED} />)
    expect(container.firstChild).toHaveClass('bg-slate-100', 'text-slate-700')
    expect(container.querySelector('.w-1\\.5')).toHaveClass('bg-slate-500')
  })
})