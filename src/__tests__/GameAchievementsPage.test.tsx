import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameAchievementsPage from '../pages/GameAchievementsPage'
import { useAuth } from '../context/AuthContext'
import { getGame, getGameAchievements } from '../api/gamesApi'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/gamesApi', () => ({
  getGame: vi.fn(),
  getGameAchievements: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedGetGame = vi.mocked(getGame)
const mockedGetAchievements = vi.mocked(getGameAchievements)

function renderPage(steamId?: string) {
  mockedUseAuth.mockReturnValue({ user: steamId ? { steamId } : null } as never)
  mockedGetGame.mockResolvedValue({ id: 'g1', title: 'Hades' } as never)
  mockedGetAchievements.mockResolvedValue({ achievements: [], totalAchieved: 0, percentage: 0 } as never)
  return render(
    <MemoryRouter initialEntries={['/juegos/g1/logros']}>
      <Routes>
        <Route path="/juegos/:id/logros" element={<GameAchievementsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GameAchievementsPage steamId', () => {
  it('pide el steamId del perfil si el usuario no tiene', async () => {
    renderPage(undefined)
    expect(await screen.findByText('Falta tu Steam ID')).toBeInTheDocument()
    expect(mockedGetAchievements).not.toHaveBeenCalled()
  })

  it('usa el steamId del usuario para cargar logros', async () => {
    renderPage('76561198000000000')
    await screen.findByText('Logros de Hades')
    expect(mockedGetAchievements).toHaveBeenCalledWith('g1', '76561198000000000')
  })
})
