import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameForm from '../components/GameForm'
import { useAuth } from '../context/AuthContext'
import { GameStatus } from '../types/GameStatus'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const mockedUseAuth = vi.mocked(useAuth)

function mockUser(steamId?: string) {
  mockedUseAuth.mockReturnValue({ user: steamId ? { steamId } : null } as never)
}

interface RenderOptions {
  isCreate?: boolean
  submitLabel?: string
}

function renderForm(options: RenderOptions = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const utils = render(
    <MemoryRouter>
      <GameForm submitLabel={options.submitLabel ?? 'Guardar videojuego'} onSubmit={onSubmit} isCreate={options.isCreate} />
    </MemoryRouter>,
  )
  return { onSubmit, ...utils }
}

const today = new Date().toISOString().slice(0, 10)

function acquisitionRegion() {
  return screen.getByRole('region', { name: 'Adquisición' })
}

function fechasRegion() {
  return screen.getByRole('region', { name: 'Fechas' })
}

async function fillTitleAndSubmit(user: ReturnType<typeof userEvent.setup>, onSubmit: ReturnType<typeof vi.fn>) {
  await user.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
  await user.click(screen.getByRole('button', { name: 'Guardar videojuego' }))
  expect(onSubmit).toHaveBeenCalledTimes(1)
  return onSubmit.mock.calls[0]![0] as Record<string, unknown>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GameForm platinar', () => {
  it('oculta Platinar al crear si el usuario no tiene steamId', () => {
    mockUser(undefined)
    renderForm({ isCreate: true })
    expect(screen.queryByLabelText(/Platinar/)).not.toBeInTheDocument()
  })

  it('muestra Platinar al crear si el usuario tiene steamId', () => {
    mockUser('76561198000000000')
    renderForm({ isCreate: true })
    expect(screen.getByLabelText(/Platinar/)).toBeInTheDocument()
  })

  it('muestra Platinar al editar aunque no haya steamId', () => {
    mockUser(undefined)
    renderForm()
    expect(screen.getByLabelText(/Platinar/)).toBeInTheDocument()
  })

  it('al crear en PLAYING propone hoy como fecha de obtención e inicio', async () => {
    mockUser('76561198000000000')
    renderForm({ isCreate: true })

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.PLAYING)

    expect(acquisitionRegion()).toBeInTheDocument()
    expect(acquisitionRegion().querySelector('input[type="date"]')).toHaveValue(today)

    expect(fechasRegion()).toBeInTheDocument()
    expect(fechasRegion().querySelector('input[type="date"]')).toHaveValue(today)
  })

  it('en PLAYING la fecha de inicio es obligatoria', async () => {
    mockUser('76561198000000000')
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ isCreate: true })

    await user.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.PLAYING)
    await user.clear(fechasRegion().querySelector('input[type="date"]')!)
    await user.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await user.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de inicio es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('en COMPLETED la fecha de fin es obligatoria', async () => {
    mockUser('76561198000000000')
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ isCreate: true })

    await user.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.COMPLETED)
    const dates = fechasRegion().querySelectorAll('input[type="date"]')
    await user.clear(dates[1]!)
    await user.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await user.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de fin es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('GameForm adquisición', () => {
  it('en En posesión propone hoy como fecha de obtención, oculta fechas de seguimiento y envía la adquisición', async () => {
    mockUser('76561198000000000')
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ isCreate: true })

    await user.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.OWNED)

    expect(acquisitionRegion()).toBeInTheDocument()
    expect(acquisitionRegion().querySelector('input[type="date"]')).toHaveValue(today)
    expect(screen.queryByRole('region', { name: 'Fechas' })).not.toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await user.type(acquisitionRegion().querySelector('input[type="number"]')!, '12.5')
    await user.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0]![0] as Record<string, unknown>
    expect(payload.acquisitionDate).toBe(today)
    expect(payload.acquisitionPrice).toBe(12.5)
    expect(payload.dateAdded).toBeUndefined()
    expect(payload.dateCompleted).toBeUndefined()
  })

  it('en En posesión el precio de adquisición es obligatorio', async () => {
    mockUser('76561198000000000')
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ isCreate: true })

    await user.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.OWNED)
    await user.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await user.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El precio de adquisición es obligatorio.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('al crear con PLAYING la adquisición también es obligatoria', async () => {
    mockUser('76561198000000000')
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ isCreate: true })

    await user.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.PLAYING)
    await user.clear(acquisitionRegion().querySelector('input[type="date"]')!)
    await user.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await user.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de obtención es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('en Lista de deseos no muestra adquisición ni la envía', async () => {
    mockUser('76561198000000000')
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ isCreate: true })

    expect(screen.queryByRole('region', { name: 'Adquisición' })).not.toBeInTheDocument()

    const payload = await fillTitleAndSubmit(user, onSubmit)
    expect(payload.acquisitionDate).toBeUndefined()
    expect(payload.acquisitionPrice).toBeUndefined()
  })

  it('al editar pre-rellena la fecha y el precio de adquisición y los envía', async () => {
    mockUser('76561198000000000')
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <GameForm
          submitLabel="Guardar videojuego"
          onSubmit={onSubmit}
          initial={{
            status: GameStatus.OWNED,
            acquisitionDate: '2024-03-15',
            acquisitionPrice: 24.99,
          }}
        />
      </MemoryRouter>,
    )

    expect(acquisitionRegion().querySelector('input[type="date"]')).toHaveValue('2024-03-15')
    expect(acquisitionRegion().querySelector('input[type="number"]')).toHaveValue(24.99)

    const payload = await fillTitleAndSubmit(user, onSubmit)
    expect(payload.acquisitionDate).toBe('2024-03-15')
    expect(payload.acquisitionPrice).toBe(24.99)
  })
})