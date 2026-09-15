import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import RegisterPage from '../pages/RegisterPage'

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
}))

import { register as apiRegister } from '../api/authApi'

const mockedRegister = vi.mocked(apiRegister)

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<div>HOME</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function fillValid() {
  await userEvent.type(screen.getByLabelText(/Usuario/), 'nuevouser')
  await userEvent.type(screen.getByLabelText(/Email/), 'nuevo@test.com')
  await userEvent.type(screen.getByLabelText(/Contraseña/), 'secret123')
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('RegisterPage', () => {
  it('renderiza los 4 campos', () => {
    renderRegister()
    expect(screen.getByLabelText(/Usuario/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre a mostrar/)).toBeInTheDocument()
  })

  it('valida en cliente sin llamar al backend', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText(/Usuario/), 'ab')
    await userEvent.type(screen.getByLabelText(/Email/), 'a@test.com')
    await userEvent.type(screen.getByLabelText(/Contraseña/), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('entre 3 y 20 caracteres')
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('muestra errores del backend', async () => {
    mockedRegister.mockRejectedValue(new Error('El usuario ya existe'))
    renderRegister()
    await fillValid()
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El usuario ya existe')
  })

  it('redirige al home tras registro exitoso', async () => {
    mockedRegister.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 'u1', username: 'nuevouser', email: 'nuevo@test.com' },
    })
    renderRegister()
    await fillValid()
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('HOME')).toBeInTheDocument()
    expect(mockedRegister).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'nuevouser', email: 'nuevo@test.com' }),
    )
  })
})
