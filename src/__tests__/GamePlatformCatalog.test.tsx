import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameForm from '../components/GameForm'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

vi.mock('../api/gamesApi', () => ({
  listGamePlatforms: vi.fn(async () => [
    { id: 1, name: 'PC', slug: 'pc' },
    { id: 2, name: 'PlayStation 5', slug: 'ps5' },
    { id: 3, name: 'Nintendo Switch', slug: 'nintendo-switch' },
  ]),
  listGameGenres: vi.fn(async () => []),
}))

const mockedUseAuth = vi.mocked(useAuth)

function renderForm(initial?: { platform: string }) {
  return render(
    <MemoryRouter>
      <GameForm submitLabel="Guardar" onSubmit={vi.fn()} isCreate initial={initial} />
    </MemoryRouter>,
  )
}

function platformSelect() {
  return screen.getByLabelText(/Plataforma/) as HTMLSelectElement
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUseAuth.mockReturnValue({ user: null } as never)
})

describe('GameForm con catálogo de plataformas', () => {
  it('ofrece las plataformas del backend, no el enum de cinco valores', async () => {
    renderForm()
    await waitFor(() => expect(platformSelect().options.length).toBe(3))
    const labels = [...platformSelect().options].map((o) => o.textContent)
    expect(labels).toEqual(['PC', 'PlayStation 5', 'Nintendo Switch'])
  })

  it('permite elegir una plataforma que no existía en el enum', async () => {
    renderForm()
    await waitFor(() => expect(platformSelect().options.length).toBe(3))
    await userEvent.selectOptions(platformSelect(), 'PlayStation 5')
    expect(platformSelect().value).toBe('PlayStation 5')
  })

  it('mantiene como opción la plataforma guardada aunque no esté en el catálogo', async () => {
    renderForm({ platform: 'WII_U' })
    // El valor sigue seleccionado aunque el catálogo no lo liste.
    expect(platformSelect().value).toBe('WII_U')
    await waitFor(() => expect(platformSelect().options.length).toBe(4))
    expect([...platformSelect().options].map((o) => o.value)).toContain('WII_U')
  })
})