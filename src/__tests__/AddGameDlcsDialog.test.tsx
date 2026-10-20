import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddGameDlcsDialog from '../components/AddGameDlcsDialog'
import { getGameAdditions } from '../api/gamesApi'
import { RequestError } from '../api/errors'
import { GameStatus } from '../types'
import type { AddGameAdditionItem, GameAddition } from '../types'

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
  onSave?: (items: AddGameAdditionItem[]) => void
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

  it('al seleccionar un DLC nuevo despliega estado, fecha de obtención y precio, y envía sus datos', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    expect(screen.queryByRole('combobox', { name: 'Estado de GOTY Edition' })).not.toBeInTheDocument()

    await user.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))

    const status = screen.getByRole('combobox', { name: 'Estado de GOTY Edition' })
    expect(status).toHaveValue(GameStatus.OWNED)
    const acquisitionDate = (screen.getByLabelText('Fecha de obtención de GOTY Edition') as HTMLInputElement).value
    expect(acquisitionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    fireEvent.change(screen.getByLabelText('Precio de GOTY Edition'), { target: { value: '9.99' } })

    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    expect(onSave).toHaveBeenCalledWith([
      expect.objectContaining({
        externalId: '3',
        status: GameStatus.OWNED,
        acquisitionDate,
        acquisitionPrice: 9.99,
      }),
    ])
    const sent = onSave.mock.calls[0]?.[0]?.[0] ?? {}
    expect(sent).not.toHaveProperty('dateAdded')
    expect(sent).not.toHaveProperty('dateCompleted')
  })

  it('cada fila lleva su estado y sus datos, y lo que ya tienes se enlaza sin pedir datos', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'Hearts of Stone' }))
    await user.click(screen.getByRole('checkbox', { name: 'GOTY Edition' }))

    expect(screen.queryByRole('combobox', { name: 'Estado de Hearts of Stone' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Precio de Hearts of Stone')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Estado de GOTY Edition' }), {
      target: { value: GameStatus.PLAYING },
    })
    const acquisitionDate = (screen.getByLabelText('Fecha de obtención de GOTY Edition') as HTMLInputElement).value
    const dateAdded = (screen.getByLabelText('Fecha de inicio de GOTY Edition') as HTMLInputElement).value
    fireEvent.change(screen.getByLabelText('Precio de GOTY Edition'), { target: { value: '4.5' } })

    await user.click(screen.getByRole('button', { name: 'Añadir 2 seleccionadas' }))

    expect(onSave).toHaveBeenCalledWith([
      { externalId: '2', status: GameStatus.OWNED, link: true },
      expect.objectContaining({
        externalId: '3',
        status: GameStatus.PLAYING,
        acquisitionDate,
        acquisitionPrice: 4.5,
        dateAdded,
      }),
    ])
  })

  it('no envía si falta el precio de una adición nueva', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))
    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El precio de adquisición es obligatorio')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('en lista de deseos no pide precio ni fechas y envía solo el estado', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Estado de GOTY Edition' }), {
      target: { value: GameStatus.WISHLIST },
    })

    expect(screen.queryByLabelText('Precio de GOTY Edition')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Fecha de obtención de GOTY Edition')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    expect(onSave).toHaveBeenCalledWith([{ externalId: '3', status: GameStatus.WISHLIST }])
  })

  it('en completado exige la fecha de fin', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Estado de GOTY Edition' }), {
      target: { value: GameStatus.COMPLETED },
    })
    fireEvent.change(screen.getByLabelText('Precio de GOTY Edition'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Fecha de fin de GOTY Edition'), { target: { value: '' } })

    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de fin es obligatoria')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('en jugando exige la fecha de inicio', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Estado de GOTY Edition' }), {
      target: { value: GameStatus.PLAYING },
    })
    fireEvent.change(screen.getByLabelText('Precio de GOTY Edition'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Fecha de inicio de GOTY Edition'), { target: { value: '' } })

    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de inicio es obligatoria')
    expect(onSave).not.toHaveBeenCalled()
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

/** Catálogo largo (6): supera el umbral de 5 para que aparezca el buscador. */
function catalogoLargo(): GameAddition[] {
  return ['Blood and Wine', 'Hearts of Stone', 'GOTY Edition', 'Free DLC 1', 'Free DLC 2', 'Free DLC 3'].map(
    (title, i) => ({ externalId: `l${i}`, title, genres: [], inCollection: false, alreadyLinked: false }),
  )
}

describe('AddGameDlcsDialog con buscador', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('con más de 5 adiciones aparece el buscador; con el catálogo corto, no', async () => {
    mockedGetAdditions.mockResolvedValue({
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: catalogoLargo(),
      totalAvailable: 6,
    })
    const { unmount } = renderDialog()

    expect(await screen.findByRole('searchbox', { name: 'Buscar contenido adicional' })).toBeInTheDocument()
    unmount()

    mockedGetAdditions.mockResolvedValue({
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: catalogo,
      totalAvailable: 3,
    })
    renderDialog()

    expect(await screen.findByRole('checkbox', { name: 'GOTY Edition' })).toBeInTheDocument()
    expect(screen.queryByRole('searchbox', { name: 'Buscar contenido adicional' })).not.toBeInTheDocument()
  })

  it('filtra las filas por título y avisa cuando no hay coincidencias', async () => {
    const user = userEvent.setup()
    mockedGetAdditions.mockResolvedValue({
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: catalogoLargo(),
      totalAvailable: 6,
    })
    renderDialog()

    const buscador = await screen.findByRole('searchbox', { name: 'Buscar contenido adicional' })
    await user.type(buscador, 'hearts')

    expect(screen.getByRole('checkbox', { name: 'Hearts of Stone' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'GOTY Edition' })).not.toBeInTheDocument()
    expect(screen.getByText('1 de 6')).toBeInTheDocument()

    await user.clear(buscador)
    await user.type(buscador, 'zzz')

    expect(screen.queryByRole('checkbox', { name: 'Hearts of Stone' })).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/no hay coincidencias/i)
  })

  it('mantiene la selección hecha cuando el filtro la oculta', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    mockedGetAdditions.mockResolvedValue({
      baseGameId: 'g1',
      baseExternalId: '292030',
      additions: catalogoLargo(),
      totalAvailable: 6,
    })
    renderDialog({ onSave })

    await user.click(await screen.findByRole('checkbox', { name: 'GOTY Edition' }))
    fireEvent.change(screen.getByLabelText('Precio de GOTY Edition'), { target: { value: '9' } })

    await user.type(screen.getByRole('searchbox', { name: 'Buscar contenido adicional' }), 'hearts')

    expect(screen.queryByRole('checkbox', { name: 'GOTY Edition' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Añadir 1 seleccionada' }))

    expect(onSave).toHaveBeenCalledWith([
      expect.objectContaining({ externalId: 'l2', status: GameStatus.OWNED, acquisitionPrice: 9 }),
    ])
  })
})
