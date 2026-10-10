import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DeckDetailPage from '../pages/DeckDetailPage'
import { getDeck, getDeckStatus } from '../api/deckApi'
import { addMagicCardFromScryfall, searchMagicCards } from '../api/magicApi'
import type { DeckResponse, MagicCardResponse } from '../types'

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

vi.mock('../api/magicApi', () => ({
  searchMagicCards: vi.fn(), // lo usa DeckCommanderImage
  addMagicCardFromScryfall: vi.fn(),
}))

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

  it('al cerrar el diálogo refresca el mazo y su estado', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    fireEvent.click(screen.getByRole('button', { name: 'Importar mazo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    await act(async () => {})

    expect(vi.mocked(getDeck)).toHaveBeenCalledTimes(2)
    expect(vi.mocked(getDeckStatus)).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('dialog', { name: 'Importar mazo' })).not.toBeInTheDocument()
  })
})

describe('DeckDetailPage añadir a colección (carta proxy)', () => {
  const proxyCard = {
    cardName: 'Sol Ring',
    quantity: 2,
    inCollection: false,
    isProxy: true,
    scryfallId: 'sr-1',
  }

  const deckConProxy: DeckResponse = {
    id: 'd1',
    name: 'Mazo de Atraxa',
    commander: 'Atraxa',
    commanderColors: ['W', 'U', 'B', 'G'],
    cards: [proxyCard],
    userOwned: { username: 'javi' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDeckStatus).mockResolvedValue({ status: 'DRAFT', message: null })
    vi.mocked(searchMagicCards).mockResolvedValue([])
    authState.value = { isAuthenticated: true, user: { username: 'javi' } }
  })

  it('muestra el botón Añadir a colección en una carta proxy sin colección', async () => {
    vi.mocked(getDeck).mockResolvedValue(deckConProxy)
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    expect(screen.getByRole('button', { name: 'Añadir a colección' })).toBeInTheDocument()
  })

  it('oculta el botón si la carta proxy ya está en colección', async () => {
    vi.mocked(getDeck).mockResolvedValue({
      ...deckConProxy,
      cards: [{ ...proxyCard, inCollection: true }],
    })
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    expect(screen.queryByRole('button', { name: 'Añadir a colección' })).not.toBeInTheDocument()
  })

  it('oculta el botón si la carta no tiene scryfallId', async () => {
    vi.mocked(getDeck).mockResolvedValue({
      ...deckConProxy,
      cards: [{ ...proxyCard, scryfallId: undefined }],
    })
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    expect(screen.queryByRole('button', { name: 'Añadir a colección' })).not.toBeInTheDocument()
  })

  it('añade a la colección la cantidad del mazo y refresca la insignia En colección', async () => {
    vi.mocked(getDeck)
      .mockResolvedValueOnce(deckConProxy)
      .mockResolvedValue({ ...deckConProxy, cards: [{ ...proxyCard, inCollection: true }] })
    vi.mocked(addMagicCardFromScryfall).mockResolvedValue({ id: 'm1' } as MagicCardResponse)
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir a colección' }))

    await waitFor(() => expect(addMagicCardFromScryfall).toHaveBeenCalledWith('sr-1', 2))
    await waitFor(() => expect(screen.getByText('En colección')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Añadir a colección' })).not.toBeInTheDocument()
  })

  it('oculta el botón y la insignia Proxy tras añadir con éxito, aunque el refresh no lo refleje', async () => {
    vi.mocked(getDeck).mockResolvedValue(deckConProxy)
    vi.mocked(addMagicCardFromScryfall).mockResolvedValue({ id: 'm1' } as MagicCardResponse)
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir a colección' }))

    await waitFor(() => expect(addMagicCardFromScryfall).toHaveBeenCalledWith('sr-1', 2))
    await waitFor(() => expect(screen.getByText('En colección')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Añadir a colección' })).not.toBeInTheDocument()
    expect(screen.queryByText('Proxy')).not.toBeInTheDocument()
  })

  it('muestra Añadiendo… mientras se envía', async () => {
    vi.mocked(getDeck).mockResolvedValue(deckConProxy)
    let resolveAdd: (value: MagicCardResponse) => void = () => {}
    vi.mocked(addMagicCardFromScryfall).mockImplementation(
      () => new Promise<MagicCardResponse>((resolve) => { resolveAdd = resolve }),
    )
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir a colección' }))

    expect(screen.getByRole('button', { name: 'Añadiendo…' })).toBeDisabled()
    await act(async () => {
      resolveAdd({ id: 'm1' } as MagicCardResponse)
    })
  })
})

describe('DeckDetailPage comandante (añadir a colección)', () => {
  const deckComandanteProxy: DeckResponse = {
    id: 'd1',
    name: 'Mazo de Atraxa',
    commander: "Atraxa, Praetors' Voice",
    commanderColors: ['W', 'U', 'B', 'G'],
    commanderInCollection: false,
    commanderIsProxy: true,
    cards: [],
    userOwned: { username: 'javi' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDeckStatus).mockResolvedValue({ status: 'DRAFT', message: null })
    vi.mocked(searchMagicCards).mockResolvedValue([])
    authState.value = { isAuthenticated: true, user: { username: 'javi' } }
  })

  it('muestra la insignia Proxy y el botón cuando el comandante no está en colección', async () => {
    vi.mocked(getDeck).mockResolvedValue(deckComandanteProxy)
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    expect(screen.getByText('Proxy')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Añadir a colección' })).toBeInTheDocument()
  })

  it('muestra En colección y oculta el botón cuando el comandante ya está en colección', async () => {
    vi.mocked(getDeck).mockResolvedValue({
      ...deckComandanteProxy,
      commanderInCollection: true,
      commanderIsProxy: false,
    })
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    expect(screen.getByText('En colección')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Añadir a colección' })).not.toBeInTheDocument()
  })

  it('oculta el botón del comandante sin sesión', async () => {
    authState.value = { isAuthenticated: false, user: null }
    vi.mocked(getDeck).mockResolvedValue(deckComandanteProxy)
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    expect(screen.queryByRole('button', { name: 'Añadir a colección' })).not.toBeInTheDocument()
  })

  it('al pulsar resuelve el comandante en Scryfall y lo añade a la colección', async () => {
    vi.mocked(getDeck).mockResolvedValue(deckComandanteProxy)
    vi.mocked(searchMagicCards).mockResolvedValue([
      { scryfallId: 'atr-1', name: "Atraxa, Praetors' Voice" },
    ])
    vi.mocked(addMagicCardFromScryfall).mockResolvedValue({ id: 'm1' } as MagicCardResponse)
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir a colección' }))

    await waitFor(() => expect(addMagicCardFromScryfall).toHaveBeenCalledWith('atr-1', 1))
    await waitFor(() => expect(screen.getByText('En colección')).toBeInTheDocument())
    expect(screen.queryByText('Proxy')).not.toBeInTheDocument()
  })

  it('no añade nada si el comandante no se resuelve en Scryfall', async () => {
    vi.mocked(getDeck).mockResolvedValue(deckComandanteProxy)
    vi.mocked(searchMagicCards).mockResolvedValue([])
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir a colección' }))

    await waitFor(() => expect(addMagicCardFromScryfall).not.toHaveBeenCalled())
  })
})

describe('DeckDetailPage tabla de cartas (columna de acciones)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getDeck).mockResolvedValue({
      id: 'd1',
      name: 'Mazo de Atraxa',
      commander: 'Atraxa',
      commanderColors: ['W', 'U', 'B', 'G'],
      cards: [
        {
          cardName: 'Sol Ring',
          quantity: 2,
          inCollection: false,
          isProxy: true,
          scryfallId: 'sr-1',
        },
      ],
      userOwned: { username: 'javi' },
    })
    vi.mocked(getDeckStatus).mockResolvedValue({ status: 'DRAFT', message: null })
    vi.mocked(searchMagicCards).mockResolvedValue([])
    authState.value = { isAuthenticated: true, user: { username: 'javi' } }
  })

  it('mantiene la celda de acciones fija a la derecha con fondo al hacer scroll', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    const celda = screen.getByRole('button', { name: 'Quitar' }).closest('td')
    expect(celda).toHaveClass('sticky', 'right-0', 'bg-cream')
  })

  it('mantiene la cabecera de acciones fija a la derecha con fondo al hacer scroll', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    const cabecera = screen.getByText('Acciones', { selector: 'span' }).closest('th')
    expect(cabecera).toHaveClass('sticky', 'right-0', 'bg-cream')
  })

  it('muestra los botones en la misma línea (el contenedor no envuelve)', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'Mazo de Atraxa' })
    const contenedor = screen.getByRole('button', { name: 'Añadir a colección' }).parentElement
    expect(contenedor).not.toHaveClass('flex-wrap')
    expect(contenedor).toHaveClass('flex', 'items-center', 'justify-end', 'gap-2')
  })
})