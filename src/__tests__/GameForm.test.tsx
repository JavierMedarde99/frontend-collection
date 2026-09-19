import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameForm from '../components/GameForm'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const mockedUseAuth = vi.mocked(useAuth)

function mockUser(steamId?: string) {
  mockedUseAuth.mockReturnValue({ user: steamId ? { steamId } : null } as never)
}

function renderForm(props: { isCreate?: boolean } = {}) {
  return render(
    <MemoryRouter>
      <GameForm submitLabel="Guardar videojuego" onSubmit={vi.fn()} {...props} />
    </MemoryRouter>,
  )
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
})
