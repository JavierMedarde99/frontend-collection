import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
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

/** Carta DFC de ejemplo: anverso y reverso con arte (contrato #570 / backend #510). */
function dfcWith(overrides: Partial<MagicCardResponse> = {}): MagicCardResponse {
  return cardWith({
    imageUrl: 'https://img/front.jpg',
    imageLargeUrl: 'https://img/front-large.jpg',
    imageUrlBack: 'https://img/back.jpg',
    imageLargeUrlBack: 'https://img/back-large.jpg',
    ...overrides,
  })
}

function IrADos() {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/magic/2')}>Ir a dos</button>
}

describe('MagicDetailPage girar carta (DFC)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el botón Girar cuando la carta tiene reverso', async () => {
    mockedGet.mockResolvedValue(dfcWith())
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dragón del tesoro' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver el reverso' })).toBeInTheDocument()
  })

  it('no muestra el botón Girar en cartas de una sola cara', async () => {
    mockedGet.mockResolvedValue(cardWith({ imageUrl: 'https://img/front.jpg' }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dragón del tesoro' })).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://img/front.jpg')
    expect(screen.queryByRole('button', { name: /ver el (reverso|anverso)/i })).not.toBeInTheDocument()
  })

  it('alterna la imagen entre anverso y reverso', async () => {
    mockedGet.mockResolvedValue(dfcWith())
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Dragón del tesoro' })).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://img/front-large.jpg')

    const girar = screen.getByRole('button', { name: 'Ver el reverso' })
    expect(girar).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(girar)

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://img/back-large.jpg')
    const volver = screen.getByRole('button', { name: 'Ver el anverso' })
    expect(volver).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(volver)

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://img/front-large.jpg')
  })

  it('vuelve al anverso al navegar a la ficha de otra carta', async () => {
    mockedGet.mockResolvedValueOnce(dfcWith())
    mockedGet.mockResolvedValueOnce(dfcWith({ id: '2', name: 'Segunda carta' }))

    render(
      <MemoryRouter initialEntries={['/magic/1']}>
        <IrADos />
        <Routes>
          <Route path="/magic/:id" element={<MagicDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Dragón del tesoro' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ver el reverso' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://img/back-large.jpg')

    fireEvent.click(screen.getByRole('button', { name: 'Ir a dos' }))

    expect(await screen.findByRole('heading', { name: 'Segunda carta' })).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://img/front-large.jpg')
  })
})