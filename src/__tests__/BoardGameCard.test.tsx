import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import BoardGameCard from '../components/BoardGameCard'
import { BoardGameStatus, type BoardGame } from '../types'

function makeGame(extra: Partial<BoardGame> = {}): BoardGame {
  return {
    id: 'bg1',
    title: 'Catan',
    status: BoardGameStatus.OWNED,
    ...extra,
  }
}

function renderCard(game: BoardGame) {
  return render(
    <MemoryRouter>
      <BoardGameCard game={game} onDelete={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('BoardGameCard badge de expansión', () => {
  it('muestra la badge Expansión cuando el juego es una expansión', () => {
    renderCard(makeGame({ bggType: 'boardgameexpansion', parentId: 'bg1', parentTitle: 'Catan' }))

    expect(screen.getByText('Expansión')).toBeInTheDocument()
  })

  it('no muestra la badge en un juego base', () => {
    renderCard(makeGame({ bggType: 'boardgame' }))

    expect(screen.queryByText('Expansión')).not.toBeInTheDocument()
  })

  it('no muestra la badge en los registros antiguos sin tipo', () => {
    renderCard(makeGame())

    expect(screen.queryByText('Expansión')).not.toBeInTheDocument()
  })
})
