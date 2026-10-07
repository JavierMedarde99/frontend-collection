import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DeckImportDialog from '../components/DeckImportDialog'
import type { DeckImportDialogProps } from '../components/DeckImportDialog'
import { addCardToDeck, getDeckImportJob, importDeckFile, importDeckText } from '../api/deckApi'
import type { DeckImportAcceptedResponse, DeckImportJobResponse, DeckResponse } from '../types'

vi.mock('../api/deckApi', () => ({
  importDeckText: vi.fn(),
  importDeckFile: vi.fn(),
  getDeckImportJob: vi.fn(),
  addCardToDeck: vi.fn(),
}))

const mockedImportText = vi.mocked(importDeckText)
const mockedImportFile = vi.mocked(importDeckFile)
const mockedGetJob = vi.mocked(getDeckImportJob)
const mockedAddCard = vi.mocked(addCardToDeck)

const accepted = { jobId: 'job-1', status: 'PENDING', statusUrl: 'x' }

const deck: DeckResponse = {
  id: 'd1',
  name: 'Mazo de Atraxa',
  commander: 'Atraxa',
  commanderColors: ['W', 'U', 'B', 'G'],
  cards: [{ cardName: 'Sol Ring', quantity: 1, inCollection: false, isProxy: false }],
}

const completedJob: DeckImportJobResponse = {
  jobId: 'job-1',
  status: 'COMPLETED',
  phase: 'DONE',
  deck,
  commander: 'Atraxa',
  commanderColors: ['W', 'U', 'B', 'G'],
  unresolved: [],
  validation: { status: 'COMPLETE', reasons: [] },
  error: null,
  progress: { total: 1, processed: 1, resolved: 1, sideboardIgnored: 0 },
  createdAt: '2026-10-06T10:00:00Z',
  updatedAt: '2026-10-06T10:00:01Z',
  completedAt: '2026-10-06T10:00:01Z',
}

const runningJob: DeckImportJobResponse = {
  ...completedJob,
  status: 'RUNNING',
  phase: 'RESOLVING',
  progress: { total: 10, processed: 5, resolved: 3, sideboardIgnored: 0 },
}

const failedJob: DeckImportJobResponse = {
  ...completedJob,
  status: 'FAILED',
  error: 'Formato no reconocido',
}

const ambiguousJob: DeckImportJobResponse = {
  ...completedJob,
  unresolved: [
    {
      line: 2,
      raw: '2 Sol Ring',
      quantity: 2,
      name: 'Sol Ring',
      reason: 'AMBIGUOUS',
      candidates: [
        { scryfallId: 'c1', name: 'Sol Ring', setName: 'Commander 2020', type: 'Artifact' },
        { scryfallId: 'c2', name: 'Sol Ring', setName: 'Commander 2016', type: 'Artifact' },
      ],
    },
  ],
}

function renderDialog(overrides: Partial<DeckImportDialogProps> = {}) {
  const onClose = vi.fn()
  const onImported = vi.fn()
  render(
    <DeckImportDialog
      open
      deckId="d1"
      deckName="Mazo de Atraxa"
      onClose={onClose}
      onImported={onImported}
      {...overrides}
    />,
  )
  return { onClose, onImported }
}

function typeLista(value: string) {
  fireEvent.change(screen.getByLabelText('Lista de cartas'), { target: { value } })
}

async function importarPorTexto() {
  typeLista('1 Sol Ring')
  fireEvent.click(screen.getByRole('button', { name: 'Importar mazo' }))
  await act(async () => {})
}

describe('DeckImportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra las dos fuentes, el selector de modo y el botón deshabilitado sin contenido', () => {
    renderDialog()

    expect(screen.getByRole('button', { name: 'Pegar lista' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Subir archivo' })).toBeInTheDocument()
    expect(screen.getByLabelText('Modo de importación')).toHaveValue('replace')
    expect(screen.getByRole('button', { name: 'Importar mazo' })).toBeDisabled()
  })

  it('habilita Importar al escribir y envía importDeckText con mode=replace', async () => {
    mockedImportText.mockResolvedValue(accepted)
    renderDialog()

    typeLista('1 Sol Ring')
    expect(screen.getByRole('button', { name: 'Importar mazo' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Importar mazo' }))
    await act(async () => {})

    expect(mockedImportText).toHaveBeenCalledWith('d1', '1 Sol Ring', 'replace')
  })

  it('envía mode=merge cuando se selecciona', async () => {
    mockedImportText.mockResolvedValue(accepted)
    renderDialog()

    fireEvent.change(screen.getByLabelText('Modo de importación'), { target: { value: 'merge' } })
    typeLista('1 Sol Ring')
    fireEvent.click(screen.getByRole('button', { name: 'Importar mazo' }))
    await act(async () => {})

    expect(mockedImportText).toHaveBeenCalledWith('d1', '1 Sol Ring', 'merge')
  })

  it('importa por archivo y sube el File en el campo file', async () => {
    mockedImportFile.mockResolvedValue(accepted)
    renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Subir archivo' }))
    const file = new File(['1 Sol Ring'], 'mazo.txt')
    fireEvent.change(screen.getByLabelText(/archivo/i), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Importar mazo' }))
    await act(async () => {})

    expect(mockedImportFile).toHaveBeenCalledWith('d1', expect.any(File), 'replace')
  })

  it('hace polling de RUNNING a COMPLETED, muestra el resumen y notifica onImported una vez', async () => {
    vi.useFakeTimers()
    mockedImportText.mockResolvedValue(accepted)
    mockedGetJob.mockResolvedValueOnce(runningJob).mockResolvedValueOnce(completedJob)
    const { onImported } = renderDialog()

    await importarPorTexto()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(screen.getByText('Resolviendo cartas…')).toBeInTheDocument()
    expect(screen.getByText('5 de 10 cartas')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(screen.getByText('Completo')).toBeInTheDocument()
    expect(screen.getByText('Atraxa')).toBeInTheDocument()
    expect(screen.getByText('1 carta · 1 distinta')).toBeInTheDocument()
    expect(onImported).toHaveBeenCalledTimes(1)
    expect(onImported).toHaveBeenCalledWith(deck)
  })

  it('muestra el error del job cuando falla', async () => {
    vi.useFakeTimers()
    mockedImportText.mockResolvedValue(accepted)
    mockedGetJob.mockResolvedValue(failedJob)
    const { onClose } = renderDialog()

    await importarPorTexto()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(screen.getByText(/Formato no reconocido/)).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' })[1]!)
    expect(onClose).toHaveBeenCalled()
  })

  it('añadir un candidato llama a addCardToDeck con la cantidad y refresca', async () => {
    vi.useFakeTimers()
    mockedImportText.mockResolvedValue(accepted)
    mockedGetJob.mockResolvedValue(ambiguousJob)
    const { onImported } = renderDialog()

    await importarPorTexto()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    const updatedDeck: DeckResponse = {
      ...deck,
      cards: [{ cardName: 'Sol Ring', quantity: 2, inCollection: false, isProxy: false }],
    }
    mockedAddCard.mockResolvedValue(updatedDeck)

    fireEvent.click(screen.getAllByRole('button', { name: 'Añadir' })[0]!)
    await act(async () => {})

    expect(mockedAddCard).toHaveBeenCalledWith('d1', { scryfallId: 'c1', quantity: 2 })
    expect(onImported).toHaveBeenCalledWith(updatedDeck)
    expect(screen.queryByText(/Línea 2/)).not.toBeInTheDocument()
  })

  it('ignorar quita la entrada de la lista', async () => {
    vi.useFakeTimers()
    mockedImportText.mockResolvedValue(accepted)
    mockedGetJob.mockResolvedValue(ambiguousJob)
    renderDialog()

    await importarPorTexto()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(screen.getByText(/Línea 2/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ignorar' }))
    expect(screen.queryByText(/Línea 2/)).not.toBeInTheDocument()
  })

  it('el botón de cerrar de la fuente invoca onClose', () => {
    const { onClose } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('lleva el foco al diálogo al abrir y lo cierra con Escape', () => {
    const { onClose } = renderDialog()

    expect(screen.getByRole('dialog', { name: 'Importar mazo' })).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('no cierra con Escape mientras envía', async () => {
    vi.useFakeTimers()
    let resolveImport!: (v: DeckImportAcceptedResponse) => void
    mockedImportText.mockImplementation(() => new Promise((res) => { resolveImport = res }))
    const { onClose } = renderDialog()

    typeLista('1 Sol Ring')
    fireEvent.click(screen.getByRole('button', { name: 'Importar mazo' }))
    await act(async () => {})

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()

    await act(async () => { resolveImport(accepted) })
  })

  it('deshabilita Importar y el cierre mientras envía', async () => {
    vi.useFakeTimers()
    let resolveImport!: (v: DeckImportAcceptedResponse) => void
    mockedImportText.mockImplementation(() => new Promise((res) => { resolveImport = res }))
    renderDialog()

    typeLista('1 Sol Ring')
    fireEvent.click(screen.getByRole('button', { name: 'Importar mazo' }))
    await act(async () => {})

    expect(screen.getByRole('button', { name: 'Importando…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeDisabled()

    await act(async () => { resolveImport(accepted) })
  })

  it('muestra el error si el polling falla', async () => {
    vi.useFakeTimers()
    mockedImportText.mockResolvedValue(accepted)
    mockedGetJob.mockRejectedValue(new Error('La red de Scryfall está caída'))
    renderDialog()

    await importarPorTexto()
    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })

    expect(screen.getByText(/La red de Scryfall está caída/)).toBeInTheDocument()
  })

  it('no muestra la ficha de validación cuando el job no la trae', async () => {
    vi.useFakeTimers()
    mockedImportText.mockResolvedValue(accepted)
    mockedGetJob.mockResolvedValue({ ...completedJob, validation: null })
    renderDialog()

    await importarPorTexto()
    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })

    expect(screen.queryByText('Completo')).not.toBeInTheDocument()
    expect(screen.getByText('1 carta · 1 distinta')).toBeInTheDocument()
  })
})