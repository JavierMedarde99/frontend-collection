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
})
