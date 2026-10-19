import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddExpansionsDialog from '../components/AddExpansionsDialog'
import { getExpansions } from '../api/boardgamesApi'
import { RequestError } from '../api/errors'
import type { AddExpansionItem, BoardGameExpansion } from '../types'

vi.mock('../api/boardgamesApi', () => ({
  getExpansions: vi.fn(),
}))

const mockedGetExpansions = vi.mocked(getExpansions)

const catalogo: BoardGameExpansion[] = [
  { bggId: '926', title: 'Catan: Navegantes', yearPublished: 1997, inCollection: true },
  { bggId: '325', title: 'Catan: Pueblos Originarios', yearPublished: 1995, inCollection: false },
]

/** Fecha local de hoy en formato ISO (lo mismo que debe poner el diálogo por defecto). */
function hoy(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function renderDialog(overrides: { onSave?: (items: AddExpansionItem[]) => void; saveError?: string | null } = {}) {
  return render(
    <AddExpansionsDialog
      baseId="bg1"
      onSave={overrides.onSave ?? vi.fn()}
      onClose={vi.fn()}
      saveError={overrides.saveError ?? null}
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

  it('envía la seleccionada en posesión con su precio y la fecha de hoy por defecto', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'Catan: Pueblos Originarios' }))
    fireEvent.change(screen.getByLabelText('Precio de Catan: Pueblos Originarios'), { target: { value: '12.5' } })

    const boton = screen.getByRole('button', { name: 'Añadir 1 seleccionada' })
    expect(boton).toBeEnabled()
    await user.click(boton)

    expect(onSave).toHaveBeenCalledWith([
      { bggId: '325', status: 'OWNED', acquisitionPrice: 12.5, dateAdded: hoy() },
    ])
  })

  it('en posesión exige precio: no envía, avisa bajo la fila y el aviso desaparece al rellenarlo', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'Catan: Pueblos Originarios' }))
    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/precio de adquisición/i)

    fireEvent.change(screen.getByLabelText('Precio de Catan: Pueblos Originarios'), { target: { value: '9' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))
    expect(onSave).toHaveBeenCalledWith([
      { bggId: '325', status: 'OWNED', acquisitionPrice: 9, dateAdded: hoy() },
    ])
  })

  it('por defecto es En posesión con la fecha de hoy, y al marcar Deseada oculta precio y fecha', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(await screen.findByRole('checkbox', { name: 'Catan: Pueblos Originarios' }))

    const estado = screen.getByRole('combobox', { name: 'Estado de Catan: Pueblos Originarios' })
    expect(estado).toHaveValue('OWNED')
    expect(screen.getByLabelText('Fecha de adición de Catan: Pueblos Originarios')).toHaveValue(hoy())
    expect((screen.getByLabelText('Precio de Catan: Pueblos Originarios') as HTMLInputElement).value).toBe('')

    fireEvent.change(estado, { target: { value: 'WISHLIST' } })

    expect(screen.queryByLabelText('Precio de Catan: Pueblos Originarios')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Fecha de adición de Catan: Pueblos Originarios')).not.toBeInTheDocument()
  })

  it('mezcla estados en la misma petición: una en posesión con datos y otra deseada sin ellos', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    mockedGetExpansions.mockResolvedValue({
      baseGameId: 'bg1',
      baseBggId: '13',
      expansions: [
        { bggId: '325', title: 'Pueblos Originarios', inCollection: false },
        { bggId: '501', title: 'Navegantes', inCollection: false },
      ],
    })
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'Pueblos Originarios' }))
    await user.click(await screen.findByRole('checkbox', { name: 'Navegantes' }))
    fireEvent.change(screen.getByLabelText('Precio de Pueblos Originarios'), { target: { value: '20' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Estado de Navegantes' }), {
      target: { value: 'WISHLIST' },
    })

    await user.click(screen.getByRole('button', { name: 'Añadir 2 seleccionadas' }))

    expect(onSave).toHaveBeenCalledWith([
      { bggId: '325', status: 'OWNED', acquisitionPrice: 20, dateAdded: hoy() },
      { bggId: '501', status: 'WISHLIST' },
    ])
  })

  it('muestra dentro del diálogo el error que devuelve el backend al guardar', async () => {
    renderDialog({ saveError: 'expansions[0].acquisitionPrice: El precio mínimo es 0' })

    expect(await screen.findByRole('alert')).toHaveTextContent('expansions[0].acquisitionPrice')
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
