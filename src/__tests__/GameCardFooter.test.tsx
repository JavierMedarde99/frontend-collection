import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameCard from '../components/GameCard'
import { GameStatus } from '../types'
import type { Game } from '../types'

vi.mock('../api/gamesApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/gamesApi')>()),
  updateGame: vi.fn(),
}))

const playingSteamGame: Game = {
  id: '1',
  title: 'Hollow Knight',
  platform: 'PC (Windows)',
  status: GameStatus.PLAYING,
  steamAppId: '367520',
  obtainPlatinum: true,
  genres: ['Metroidvania'],
}

function renderCard() {
  return render(
    <MemoryRouter>
      <GameCard game={playingSteamGame} onDelete={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('GameCard pie con botones de logros', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('junto al estado jugando muestra Ver logros, Completado y Editar', () => {
    renderCard()
    expect(screen.getByRole('link', { name: /Ver logros/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marcar Hollow Knight como completado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Editar Hollow Knight/ })).toBeInTheDocument()
  })

  it('la fila de botones y el pie admiten envoltura para no desbordar la tarjeta', () => {
    renderCard()

    const row = screen.getByText('Ver logros').parentElement
    expect(row).not.toBeNull()
    expect(row?.className).toContain('flex-wrap')
    expect(row?.className).toContain('justify-end')

    const footer = row?.parentElement
    expect(footer).not.toBeNull()
    expect(footer?.className).toContain('flex-wrap')
    expect(footer?.className).toContain('justify-between')
  })
})