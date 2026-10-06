import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DeckDetailPage from '../pages/DeckDetailPage'
import { getDeck, getDeckStatus } from '../api/deckApi'
import { searchMagicCards } from '../api/magicApi'
import type { DeckResponse } from '../types'

const { authState } = vi.hoisted(() => ({
  authState: {
    value: { isAuthenticated: true, user: { username: 'javi' } } as {
      isAuthenticated: boolean
      user: { username: string } | null
    },
  },
}))

vi.mock('../api/deckApi', () => ({
  getDeck: vi.fn(),
  getDeckStatus: vi.fn(),
  addCardToDeck: vi.fn(),
  removeCardFromDeck: vi.fn(),
  deleteDeck: vi.fn(),
  importDeckText: vi.fn(),
  importDeckFile: vi.fn(),
  getDeckImportJob: vi.fn(),
}))

vi.mock('../api/magicApi', () => ({ searchMagicCards: vi.fn() })) // lo usa DeckCommanderImage

vi.mock('../context/AuthContext', () => ({ useAuth: () => authState.value }))

const deck: DeckResponse = {
  id: 'd1',
  name: 'Mazo de Atraxa',
  commander: 'Atraxa',
  commanderColors: ['W', 'U', 'B', 'G'],
  cards: [],
  userOwned: { username: 'javi' },
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/magic/mazos/d1']}>
      <Routes>
        <Route path="/magic/mazos/:id" element={<DeckDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DeckDetailPage importación de mazos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDeck).mockResolvedValue(deck)
    vi.mocked(getDeckStatus).mockResolvedValue({ status: 'DRAFT', message: null })
    vi.mocked(searchMagicCards).mockResolvedValue([])
    authState.value = { isAuthenticated: true, user: { username: 'javi' } }
  })

  it('muestra el botón Importar mazo para el dueño y abre el diálogo', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    const importar = screen.getByRole('button', { name: 'Importar mazo' })
    expect(importar).toBeInTheDocument()

    fireEvent.click(importar)

    expect(screen.getByRole('dialog', { name: 'Importar mazo' })).toBeInTheDocument()
  })

  it('oculta el botón Importar mazo sin sesión', async () => {
    authState.value = { isAuthenticated: false, user: null }
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    expect(screen.queryByRole('button', { name: 'Importar mazo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Añadir carta' })).not.toBeInTheDocument()
  })

  it('al cerrar el diálogo se desmonta', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    fireEvent.click(screen.getByRole('button', { name: 'Importar mazo' }))
    expect(screen.getByRole('dialog', { name: 'Importar mazo' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(screen.queryByRole('dialog', { name: 'Importar mazo' })).not.toBeInTheDocument()
  })
})