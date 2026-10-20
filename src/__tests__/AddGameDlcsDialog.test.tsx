import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddGameDlcsDialog from '../components/AddGameDlcsDialog'
import { getGameAdditions } from '../api/gamesApi'
import { RequestError } from '../api/errors'
import { GameStatus } from '../types'
import type { GameAddition } from '../types'

vi.mock('../api/gamesApi', () => ({
  getGameAdditions: vi.fn(),
}))

const mockedGetAdditions = vi.mocked(getGameAdditions)

const catalogo: GameAddition[] = [
  {
    externalId: '1',
    title: 'Blood and Wine',
    genres: ['RPG'],
    inCollection: true,
    alreadyLinked: true,
  },
  {
    externalId: '2',
    title: 'Hearts of Stone',
    genres: ['RPG'],
    inCollection: true,
    alreadyLinked: false,
  },
  {
    externalId: '3',
    title: 'GOTY Edition',
    genres: ['RPG'],
    inCollection: false,
    alreadyLinked: false,
  },
]

function renderDialog(overrides: {
  onSave?: (externalIds: string[], status: GameStatus) => void
  saveError?: string | null
} = {}) {
  return render(
    <AddGameDlcsDialog
      baseId="g1"
      onSave={overrides.onSave ?? vi.fn()}
      onClose={vi.fn()}
      saveError={overrides.saveError ?? null}
    />,
  )
}

describe('AddGameDlcsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetAdditions.mockResolvedValue({
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: catalogo,
      totalAvailable: 3,
    })
  })

  it('marca y deshabilita lo ya vinculado, y deja vincular lo que ya tienes suelto', async () => {
    renderDialog()

    const vinculado = await screen.findByRole('checkbox', { name: 'Blood and Wine' })
    expect(vinculado).toBeChecked()
    expect(vinculado).toBeDisabled()
    expect(screen.getByText('Ya vinculado')).toBeInTheDocument()

    const suelto = screen.getByRole('checkbox', { name: 'Hearts of Stone' })
    expect(suelto).not.toBeChecked()
    expect(suelto).not.toBeDisabled()
    expect(screen.getByText('Ya en tu colección (se vinculará)')).toBeInTheDocument()

    const nuevo = screen.getByRole('checkbox', { name: 'GOTY Edition' })
    expect(nuevo).not.toBeChecked()
    expect(nuevo).not.toBeDisabled()
  })

  it('por defecto nace en posesión y envía los ids seleccionados con ese estado', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    expect(await screen.findByRole('combobox', { name: 'Estado de las seleccionadas' })).toHaveValue(GameStatus.OWNED)

    await user.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))
    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    expect(onSave).toHaveBeenCalledWith(['3'], GameStatus.OWNED)
  })

  it('aplica el estado elegido a todo el lote, incluido el que ya tenías suelto', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'Hearts of Stone' }))
    await user.click(screen.getByRole('checkbox', { name: 'GOTY Edition' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Estado de las seleccionadas' }), {
      target: { value: GameStatus.COMPLETED },
    })
    await user.click(screen.getByRole('button', { name: 'Añadir 2 seleccionadas' }))

    expect(onSave).toHaveBeenCalledWith(['2', '3'], GameStatus.COMPLETED)
  })

  it('sin contenido adicional muestra un aviso de lista vacía, no el de error de RAWG', async () => {
    mockedGetAdditions.mockResolvedValue({
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: [],
      totalAvailable: 0,
    })
    renderDialog()

    expect(await screen.findByText(/no tiene contenido adicional en RAWG/i)).toBeInTheDocument()
    expect(screen.queryByText(/RAWG no responde/i)).not.toBeInTheDocument()
  })

  it('si RAWG falla con 502 muestra el aviso específico y permite reintentar', async () => {
    const user = userEvent.setup()
    mockedGetAdditions.mockRejectedValueOnce(new RequestError('Error 502', 502))
    renderDialog()

    expect(await screen.findByText('RAWG no responde, inténtalo en un momento.')).toBeInTheDocument()
    expect(screen.queryByText(/no tiene contenido adicional/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('checkbox', { name: 'GOTY Edition' })).toBeInTheDocument()
    expect(screen.queryByText('RAWG no responde, inténtalo en un momento.')).not.toBeInTheDocument()
  })

  it('avisa cuando RAWG tiene más adiciones de las que se han traído', async () => {
    mockedGetAdditions.mockResolvedValue({
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: catalogo,
      totalAvailable: 52,
    })
    renderDialog()

    expect(await screen.findByText(/RAWG lista 52 adiciones; se muestran las primeras 3/i)).toBeInTheDocument()
  })

  it('muestra dentro del diálogo el error que devuelve el backend al guardar', async () => {
    renderDialog({ saveError: 'externalIds: No se pueden añadir más de 40 adiciones por petición' })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pueden añadir más de 40 adiciones')
  })

  it('limita a 40 las adiciones nuevas seleccionadas por petición', async () => {
    const muchas: GameAddition[] = Array.from({ length: 41 }, (_, i) => ({
      externalId: `e${i}`,
      title: `Adición ${i}`,
      genres: [],
      inCollection: false,
      alreadyLinked: false,
    }))
    mockedGetAdditions.mockResolvedValue({
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: muchas,
      totalAvailable: 41,
    })
    renderDialog()

    await screen.findByRole('checkbox', { name: 'Adición 0' })
    for (let i = 0; i < 40; i += 1) {
      fireEvent.click(screen.getByRole('checkbox', { name: `Adición ${i}` }))
    }

    expect(screen.getByRole('button', { name: 'Añadir 40 seleccionadas' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'Adición 40' })).toBeDisabled()
    expect(screen.getByText(/Máximo 40 adiciones por petición/i)).toBeInTheDocument()
  })
})
