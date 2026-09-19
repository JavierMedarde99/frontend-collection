import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from '../pages/ProfilePage'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../components/ProfileView', () => ({ default: () => <div>PERFIL</div> }))

const mockedUseAuth = vi.mocked(useAuth)
const updateProfile = vi.fn()

function renderProfile(steamId?: string) {
  mockedUseAuth.mockReturnValue({
    user: {
      id: 'u1',
      username: 'javi',
      email: 'javi@test.com',
      ...(steamId ? { steamId } : {}),
    },
    updateProfile,
    deleteAccount: vi.fn(),
  } as never)
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfilePage steamId', () => {
  it('precarga el steamId en el editor', async () => {
    renderProfile('76561198000000000')
    await userEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    expect(screen.getByLabelText(/Steam ID/)).toHaveValue('76561198000000000')
  })

  it('guarda el steamId al editar', async () => {
    renderProfile(undefined)
    await userEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    await userEvent.type(screen.getByLabelText(/Steam ID/), '76561198000000001')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ steamId: '76561198000000001' }))
  })

  it('rechaza un steamId inválido sin llamar al backend', async () => {
    renderProfile(undefined)
    await userEvent.click(screen.getByRole('button', { name: 'Editar perfil' }))
    await userEvent.type(screen.getByLabelText(/Steam ID/), 'abc')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('17 dígitos')
    expect(updateProfile).not.toHaveBeenCalled()
  })
})
