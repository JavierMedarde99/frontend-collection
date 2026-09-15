import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
}))

import { refresh as apiRefresh } from '../api/authApi'

const mockedRefresh = vi.mocked(apiRefresh)

function ShowState() {
  const location = useLocation()
  return <div>LOGIN state={JSON.stringify((location.state as { from?: string } | null)?.from ?? null)}</div>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/nuevo" element={<ProtectedRoute><div>SECRETO</div></ProtectedRoute>} />
          <Route path="/login" element={<ShowState />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('ProtectedRoute', () => {
  it('redirige a /login con el origen si no hay sesión', async () => {
    renderAt('/nuevo')

    expect(await screen.findByText('LOGIN state="/nuevo"')).toBeInTheDocument()
  })

  it('renderiza los children si hay sesión restaurada', async () => {
    localStorage.setItem('collection.refreshToken', 'tok')
    mockedRefresh.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r2',
      user: { id: 'u1', username: 'javi', email: 'j@t.com' },
    })
    renderAt('/nuevo')

    expect(await screen.findByText('SECRETO')).toBeInTheDocument()
  })
})
