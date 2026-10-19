import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddExpansionsDialog from '../components/AddExpansionsDialog'
import { getExpansions } from '../api/boardgamesApi'
import { RequestError } from '../api/errors'
import type { BoardGameExpansion } from '../types'

vi.mock('../api/boardgamesApi', () => ({
  getExpansions: vi.fn(),
}))

const mockedGetExpansions = vi.mocked(getExpansions)

const catalogo: BoardGameExpansion[] = [
  { bggId: '926', title: 'Catan: Navegantes', yearPublished: 1997, inCollection: true },
  { bggId: '325', title: 'Catan: Pueblos Originarios', yearPublished: 1995, inCollection: false },
]

function renderDialog(overrides: { onSave?: (bggIds: string[]) => void } = {}) {
  return render(
    <AddExpansionsDialog
      baseId="bg1"
      onSave={overrides.onSave ?? vi.fn()}
      onClose={vi.fn()}
    />,
  )
}

describe('AddExpansionsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetExpansions.mockResolvedValue({ baseGameId: 'bg1', baseBggId: '13', expansions: catalogo })
  })

  it('lista las expansiones con las que ya tienes marcadas y deshabilitadas', async () => {
    renderDialog()

    const yaTienes = await screen.findByRole('checkbox', { name: 'Catan: Navegantes' })
    expect(yaTienes).toBeChecked()
    expect(yaTienes).toBeDisabled()

    const nueva = screen.getByRole('checkbox', { name: 'Catan: Pueblos Originarios' })
    expect(nueva).not.toBeChecked()
    expect(nueva).not.toBeDisabled()
    expect(screen.getByText('Ya en tu colección')).toBeInTheDocument()
  })

  it('envía solo las expansiones nuevas seleccionadas, sin las que ya tienes', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'Catan: Pueblos Originarios' }))

    const boton = screen.getByRole('button', { name: 'Añadir 1 seleccionada' })
    expect(boton).toBeEnabled()
    await user.click(boton)

    expect(onSave).toHaveBeenCalledWith(['325'])
  })

  it('sin expansiones muestra un aviso de lista vacía, no el de error de BGG', async () => {
    mockedGetExpansions.mockResolvedValue({ baseGameId: 'bg1', baseBggId: '13', expansions: [] })
    renderDialog()

    expect(await screen.findByText(/no tiene expansiones en BGG/i)).toBeInTheDocument()
    expect(screen.queryByText(/BGG no responde/i)).not.toBeInTheDocument()
  })

  it('si BGG falla con 502 muestra el aviso específico y permite reintentar', async () => {
    const user = userEvent.setup()
    mockedGetExpansions.mockRejectedValueOnce(new RequestError('Error 502', 502))
    renderDialog()

    expect(await screen.findByText('BGG no responde, inténtalo en un momento.')).toBeInTheDocument()
    expect(screen.queryByText(/no tiene expansiones en BGG/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('checkbox', { name: 'Catan: Navegantes' })).toBeInTheDocument()
    expect(screen.queryByText('BGG no responde, inténtalo en un momento.')).not.toBeInTheDocument()
  })

  it('limita a 20 las expansiones nuevas seleccionadas por petición', async () => {
    const user = userEvent.setup()
    const muchas: BoardGameExpansion[] = Array.from({ length: 21 }, (_, i) => ({
      bggId: `e${i}`,
      title: `Expansión ${i}`,
      inCollection: false,
    }))
    mockedGetExpansions.mockResolvedValue({ baseGameId: 'bg1', baseBggId: '13', expansions: muchas })
    renderDialog()

    for (let i = 0; i < 20; i += 1) {
      await user.click(await screen.findByRole('checkbox', { name: `Expansión ${i}` }))
    }

    expect(screen.getByRole('button', { name: 'Añadir 20 seleccionadas' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'Expansión 20' })).toBeDisabled()
    expect(screen.getByText(/Máximo 20 expansiones por petición/i)).toBeInTheDocument()
  })
})
