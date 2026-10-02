import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MagicCreatePage from '../pages/MagicCreatePage'
import { addMagicCardFromScryfall, getMagicCardPrintingsPage, searchMagicCardsPage } from '../api/magicApi'
import type { MagicCardSearchResult } from '../types'

vi.mock('../api/magicApi', () => ({
  searchMagicCardsPage: vi.fn(),
  addMagicCardFromScryfall: vi.fn(),
  getMagicCardPrintingsPage: vi.fn(),
}))

const mockedSearch = vi.mocked(searchMagicCardsPage)
const mockedAdd = vi.mocked(addMagicCardFromScryfall)
const mockedPrintings = vi.mocked(getMagicCardPrintingsPage)

const result: MagicCardSearchResult = {
  scryfallId: 'oracle-search-id',
  name: 'Plains',
  setName: 'Star Trek',
  type: 'Land',
  imageUrl: 'https://img/search.jpg',
}

const printing = {
  scryfallId: 'imp-foundations',
  name: 'Plains',
  set: 'FDN',
  setName: 'Foundations',
  collectorNumber: '263',
  rarity: 'common',
  artist: 'C. D',
  releasedAt: '2024-11-08',
  lang: 'es',
  imageUrl: 'https://img/full.jpg',
  artCropUrl: 'https://img/crop.jpg',
  finishes: ['nonfoil'],
  fullArt: true,
  promoTypes: [],
  frameEffects: [],
  borderColor: 'black',
  priceUsd: '0.05',
  priceEur: '0.04',
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/magic/nuevo']}>
      <Routes>
        <Route path="/magic/nuevo" element={<MagicCreatePage />} />
        <Route path="/magic" element={<p>Listado</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function searchAndOpen(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole('textbox', { name: 'Buscar carta' }), 'Plains')
  await user.click(screen.getByRole('button', { name: 'Buscar en Scryfall' }))
  await screen.findByText('Plains')
}

describe('MagicCreatePage selector de impresiones', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    trigger = null
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    mockedSearch.mockResolvedValue({
      content: [result],
      totalPages: 1,
      totalElements: 1,
      number: 0,
      size: 10,
      empty: false,
    })
    mockedPrintings.mockResolvedValue({
      content: [printing],
      totalPages: 1,
      totalElements: 1,
      number: 0,
      size: 175,
      first: true,
      last: true,
      empty: false,
    })
    mockedAdd.mockResolvedValue({ id: '1', name: 'Plains' } as never)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('pulsar un resultado abre el panel y pide la página 0 de impresiones', async () => {
    const user = userEvent.setup()
    renderPage()
    await searchAndOpen(user)

    await user.click(screen.getByRole('button', { name: 'Ver impresiones de Plains' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await waitFor(() => expect(mockedPrintings).toHaveBeenCalledWith('oracle-search-id', 0))
  })

  it('el botón «Elegir impresión» también abre el panel', async () => {
    const user = userEvent.setup()
    renderPage()
    await searchAndOpen(user)

    await user.click(screen.getByRole('button', { name: 'Elegir impresión de Plains' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('al elegir una impresión guarda ESA impresión con su propio scryfallId', async () => {
    const user = userEvent.setup()
    renderPage()
    await searchAndOpen(user)

    await user.click(screen.getByRole('button', { name: 'Ver impresiones de Plains' }))
    await user.click(await screen.findByRole('button', { name: 'Elegir Plains (FDN 263)' }))

    await waitFor(() =>
      expect(mockedAdd).toHaveBeenCalledWith('imp-foundations', 1),
    )
    expect(mockedAdd).not.toHaveBeenCalledWith('oracle-search-id', expect.anything())
    expect(await screen.findByText('Listado')).toBeInTheDocument()
  })

  it('cancelar el panel no guarda nada', async () => {
    const user = userEvent.setup()
    renderPage()
    await searchAndOpen(user)

    await user.click(screen.getByRole('button', { name: 'Ver impresiones de Plains' }))
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockedAdd).not.toHaveBeenCalled()
  })

  it('aplica la cantidad marcada en el resultado al guardar la impresión', async () => {
    const user = userEvent.setup()
    renderPage()
    await searchAndOpen(user)

    const qty = screen.getByLabelText('Cantidad')
    await user.click(qty)
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('3')

    await user.click(screen.getByRole('button', { name: 'Ver impresiones de Plains' }))
    await user.click(await screen.findByRole('button', { name: 'Elegir Plains (FDN 263)' }))

    await waitFor(() => expect(mockedAdd).toHaveBeenCalledWith('imp-foundations', 3))
  })

  it('muestra el error al guardar si la API falla', async () => {
    const user = userEvent.setup()
    mockedAdd.mockRejectedValueOnce(new Error('Scryfall caído'))
    renderPage()
    await searchAndOpen(user)

    await user.click(screen.getByRole('button', { name: 'Ver impresiones de Plains' }))
    await user.click(await screen.findByRole('button', { name: 'Elegir Plains (FDN 263)' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Scryfall caído')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('pide la siguiente página de impresiones al llegar al sentinela del panel', async () => {
    const user = userEvent.setup()
    const second = { ...printing, scryfallId: 'imp-mh2', setName: 'Modern Horizons 2' }
    mockedPrintings.mockResolvedValueOnce({
      content: [printing],
      totalPages: 2,
      totalElements: 2,
      number: 0,
      size: 175,
      first: true,
      last: false,
      empty: false,
    })
    mockedPrintings.mockResolvedValueOnce({
      content: [second],
      totalPages: 2,
      totalElements: 2,
      number: 1,
      size: 175,
      first: false,
      last: true,
      empty: false,
    })
    renderPage()
    await searchAndOpen(user)

    await user.click(screen.getByRole('button', { name: 'Ver impresiones de Plains' }))
    await waitFor(() => expect(mockedPrintings).toHaveBeenCalledWith('oracle-search-id', 0))
    expect(await screen.findByText('Foundations')).toBeInTheDocument()

    actIntersect()

    await waitFor(() => expect(mockedPrintings).toHaveBeenLastCalledWith('oracle-search-id', 1))
    expect(await screen.findByText('Modern Horizons 2')).toBeInTheDocument()
  })
})

function actIntersect() {
  act(() => {
    trigger?.([{ isIntersecting: true }])
  })
}