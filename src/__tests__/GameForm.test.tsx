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

  it('al crear en PLAYING propone hoy como fecha de inicio', async () => {
    mockUser('76561198000000000')
    const { container } = renderForm({ isCreate: true })

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.PLAYING)
    const dates = container.querySelectorAll('input[type="date"]')
    expect(dates).toHaveLength(1)
    expect(dates[0]).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('en PLAYING la fecha de inicio es obligatoria', async () => {
    mockUser('76561198000000000')
    const { onSubmit, container } = renderForm({ isCreate: true })

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.PLAYING)
    await userEvent.clear(container.querySelectorAll('input[type="date"]')[0]!)
    await userEvent.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de inicio es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('en COMPLETED la fecha de fin es obligatoria', async () => {
    mockUser('76561198000000000')
    const { onSubmit, container } = renderForm({ isCreate: true })

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.COMPLETED)
    await userEvent.clear(container.querySelectorAll('input[type="date"]')[1]!)
    await userEvent.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de fin es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('en En posesión (OWNED) no muestra fechas ni las envía', async () => {
    mockUser('76561198000000000')
    const { onSubmit, container } = renderForm({ isCreate: true })

    await userEvent.selectOptions(screen.getByDisplayValue('Lista de deseos'), GameStatus.OWNED)
    expect(container.querySelectorAll('input[type="date"]')).toHaveLength(0)

    await userEvent.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0]![0] as Record<string, unknown>
    expect(payload.dateAdded).toBeUndefined()
    expect(payload.dateCompleted).toBeUndefined()
  })

  it('al editar conserva la fecha y el precio de adquisición', async () => {
    mockUser('76561198000000000')
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

    await userEvent.type(screen.getByPlaceholderText('Título del videojuego'), 'Hollow Knight')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar videojuego' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0]![0] as Record<string, unknown>
    expect(payload.acquisitionDate).toBe('2024-03-15')
    expect(payload.acquisitionPrice).toBe(24.99)
  })
})
