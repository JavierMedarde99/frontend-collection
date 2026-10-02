import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MagicPrintingsPanel from '../components/MagicPrintingsPanel'
import { getMagicCardPrintingsPage } from '../api/magicApi'
import type { MagicCardPrinting, MagicCardSearchResult } from '../types'

vi.mock('../api/magicApi', () => ({
  getMagicCardPrintingsPage: vi.fn(),
}))

const mockedPrintings = vi.mocked(getMagicCardPrintingsPage)

const starTrek: MagicCardPrinting = {
  scryfallId: 'imp-star-trek',
  name: 'Plains',
  set: 'STK',
  setName: 'Star Trek',
  collectorNumber: '325',
  rarity: 'common',
  artist: 'A. B',
  releasedAt: '2024-01-01',
  lang: 'en',
  imageUrl: 'https://img/full-stk.jpg',
  artCropUrl: 'https://img/crop-stk.jpg',
  finishes: ['nonfoil', 'foil'],
  fullArt: false,
  promoTypes: [],
  frameEffects: [],
  borderColor: 'black',
  priceUsd: '0.25',
  priceEur: '0.23',
}

const foundations: MagicCardPrinting = {
  scryfallId: 'imp-foundations',
  name: 'Plains',
  set: 'FDN',
  setName: 'Foundations',
  collectorNumber: '263',
  rarity: 'uncommon',
  artist: 'C. D',
  releasedAt: '2024-11-08',
  lang: 'es',
  imageUrl: 'https://img/full-fdn.jpg',
  artCropUrl: 'https://img/crop-fdn.jpg',
  finishes: ['nonfoil'],
  fullArt: true,
  promoTypes: [],
  frameEffects: ['extendedart'],
  borderColor: 'black',
  priceUsd: '0.05',
  priceEur: '0.04',
}

const card: MagicCardSearchResult = {
  scryfallId: 'oracle-search-id',
  name: 'Plains',
  setName: 'Star Trek',
  type: 'Land',
  imageUrl: 'https://img/search.jpg',
}

type Trigger = (entries: [{ isIntersecting: boolean }]) => void
let trigger: Trigger | null = null

class MockIntersectionObserver {
  constructor(cb: Trigger) {
    trigger = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderPanel(quantity = 1, onSelect = vi.fn(), onClose = vi.fn()) {
  render(
    <MagicPrintingsPanel
      card={card}
      quantity={quantity}
      onSelect={onSelect}
      onClose={onClose}
    />,
  )
  return { onSelect, onClose }
}

function page(content: MagicCardPrinting[], totalPages: number) {
  return {
    content,
    totalPages,
    totalElements: content.length * totalPages,
    size: 175,
    number: 0,
    first: true,
    last: totalPages === 1,
    empty: content.length === 0,
  }
}

function intersect() {
  act(() => {
    trigger?.([{ isIntersecting: true }])
  })
}

describe('MagicPrintingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    trigger = null
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    mockedPrintings.mockResolvedValue(page([starTrek, foundations], 2))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('abre con la página 0 de impresiones de la carta', async () => {
    renderPanel()

    await waitFor(() => expect(mockedPrintings).toHaveBeenCalledWith('oracle-search-id', 0))
    expect(await screen.findByText('Star Trek')).toBeInTheDocument()
    expect(screen.getByText('Foundations')).toBeInTheDocument()
    expect(screen.getByText('STK')).toBeInTheDocument()
    expect(screen.getByText('325')).toBeInTheDocument()
  })

  it('muestra rareza, idioma, precio y arte alternativo', async () => {
    renderPanel()

    expect(await screen.findAllByText(/common|uncommon/i)).not.toHaveLength(0)
    expect(screen.getByText('$0.25')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
    expect(screen.getByText('Foil')).toBeInTheDocument()
    expect(screen.getByText('Full art')).toBeInTheDocument()
    expect(screen.getByText('Extended')).toBeInTheDocument()
  })

  it('al elegir una impresión envía ESA impresión con su propio scryfallId', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderPanel()

    await user.click(await screen.findByRole('button', { name: 'Elegir Plains (FDN 263)' }))

    expect(onSelect).toHaveBeenCalledWith(foundations)
    expect(onSelect).not.toHaveBeenCalledWith(starTrek)
  })

  it('cancelar cierra el panel sin elegir nada', async () => {
    const user = userEvent.setup()
    const { onSelect, onClose } = renderPanel()

    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('acumula la siguiente página al llegar al sentinela', async () => {
    const third: MagicCardPrinting = {
      ...starTrek,
      scryfallId: 'imp-mh2',
      setName: 'Modern Horizons 2',
      collectorNumber: '400',
    }
    mockedPrintings.mockResolvedValueOnce(page([starTrek, foundations], 2))
    mockedPrintings.mockResolvedValueOnce(page([third], 2))

    renderPanel()

    await waitFor(() => expect(mockedPrintings).toHaveBeenCalledWith('oracle-search-id', 0))
    expect(await screen.findByText('Star Trek')).toBeInTheDocument()

    intersect()

    await waitFor(() => expect(mockedPrintings).toHaveBeenLastCalledWith('oracle-search-id', 1))
    expect(await screen.findByText('Modern Horizons 2')).toBeInTheDocument()
  })
})