import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../pages/LoginPage'

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
}))

import { login as apiLogin } from '../api/authApi'

const mockedLogin = vi.mocked(apiLogin)

function renderLogin(initialEntries: string[] = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>HOME</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renderiza usuario y contraseña', () => {
    renderLogin()
    expect(screen.getByLabelText(/Usuario/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('el ojo muestra y oculta la contraseña', async () => {
    renderLogin()
    const password = screen.getByLabelText(/Contraseña/)
    expect(password).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('muestra error con credenciales inválidas', async () => {
    mockedLogin.mockRejectedValue(new Error('Credenciales inválidas'))
    renderLogin()

    await userEvent.type(screen.getByLabelText(/Usuario/), 'nadie')
    await userEvent.type(screen.getByLabelText(/Contraseña/), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas')
  })

  it('redirige al home tras login exitoso', async () => {
    mockedLogin.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      user: { id: 'u1', username: 'javi', email: 'j@t.com' },
    })
    renderLogin()

    await userEvent.type(screen.getByLabelText(/Usuario/), 'javi')
    await userEvent.type(screen.getByLabelText(/Contraseña/), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('HOME')).toBeInTheDocument()
  })

  it('valida los campos vacíos por campo y no llama al backend', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    const username = screen.getByLabelText(/Usuario/)
    const password = screen.getByLabelText(/Contraseña/)

    expect(await screen.findByText('El nombre de usuario es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument()
    expect(username).toHaveAttribute('aria-invalid', 'true')
    expect(username).toHaveAttribute('aria-describedby', 'login-username-error')
    expect(password).toHaveAttribute('aria-invalid', 'true')
    expect(password).toHaveAttribute('aria-describedby', 'login-password-error')
    expect(mockedLogin).not.toHaveBeenCalled()
  })

  it('enfoca el primer campo inválido al enviar', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('El nombre de usuario es obligatorio.')).toBeInTheDocument()
    expect(screen.getByLabelText(/Usuario/)).toHaveFocus()
  })

  it('limpia el error del campo al escribir', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('El nombre de usuario es obligatorio.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(/Usuario/), 'javi')

    expect(screen.queryByText('El nombre de usuario es obligatorio.')).toBeNull()
    expect(screen.getByLabelText(/Usuario/)).not.toHaveAttribute('aria-invalid')
  })
})
