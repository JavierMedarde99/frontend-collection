import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MagicDetailPage from '../pages/MagicDetailPage'
import { getMagicCard } from '../api/magicApi'
import type { MagicCardResponse } from '../types'

vi.mock('../api/magicApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/magicApi')>()),
  getMagicCard: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { username: 'javi' } }),
}))

const mockedGet = vi.mocked(getMagicCard)

function cardWith(overrides: Partial<MagicCardResponse> = {}): MagicCardResponse {
  return {
    id: '1',
    name: 'Dragón del tesoro',
    type: 'Creature — Dragon',
    power: '5',
    toughness: '5',
    ...overrides,
  }
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/magic/1']}>
      <Routes>
        <Route path="/magic/:id" element={<MagicDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MagicDetailPage vida y resistencia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra Fuerza / Resistencia para cartas criatura', async () => {
    mockedGet.mockResolvedValue(cardWith())
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dragón del tesoro' })).toBeInTheDocument()
    expect(screen.getByText('Fuerza / Resistencia')).toBeInTheDocument()
    expect(screen.getByText('5 / 5')).toBeInTheDocument()
  })

  it('muestra Fuerza / Resistencia para criaturas con tipo compuesto', async () => {
    mockedGet.mockResolvedValue(cardWith({ type: 'Legendary Enchantment Creature — God' }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dragón del tesoro' })).toBeInTheDocument()
    expect(screen.getByText('Fuerza / Resistencia')).toBeInTheDocument()
  })

  it('oculta Fuerza / Resistencia cuando el tipo no es una criatura', async () => {
    mockedGet.mockResolvedValue(cardWith({ type: 'Instant', power: '3', toughness: '3' }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dragón del tesoro' })).toBeInTheDocument()
    expect(screen.queryByText('Fuerza / Resistencia')).not.toBeInTheDocument()
    expect(screen.queryByText('3 / 3')).not.toBeInTheDocument()
  })

  it('oculta Fuerza / Resistencia en no criaturas con fuerza y resistencia (vehículos)', async () => {
    mockedGet.mockResolvedValue(cardWith({ type: 'Artifact — Vehicle', power: '3', toughness: '3' }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dragón del tesoro' })).toBeInTheDocument()
    expect(screen.queryByText('Fuerza / Resistencia')).not.toBeInTheDocument()
  })
})