import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GameForm from '../components/GameForm'
import { useAuth } from '../context/AuthContext'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

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

function platformInput() {
  return screen.getByLabelText(/Plataforma/) as HTMLInputElement
}

function optionTexts() {
  // Acotado al listbox del combobox: el select nativo de Estado también expone options.
  return within(screen.getByRole('listbox')).getAllByRole('option').map((o) => o.textContent)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUseAuth.mockReturnValue({ user: null } as never)
})

describe('GameForm con catálogo de plataformas', () => {
  it('ofrece las plataformas del backend, no el enum de cinco valores', async () => {
    renderForm()
    await userEvent.click(platformInput())

    await waitFor(() => expect(optionTexts()).toEqual(['PC', 'PlayStation 5', 'Nintendo Switch']))
  })

  it('permite elegir una plataforma que no existía en el enum', async () => {
    renderForm()
    await userEvent.click(platformInput())
    const ps5 = await screen.findByRole('option', { name: 'PlayStation 5' })
    await userEvent.click(ps5)

    expect(platformInput()).toHaveValue('PlayStation 5')
  })

  it('mantiene como opción la plataforma guardada aunque no esté en el catálogo', async () => {
    renderForm({ platform: 'WII_U' })
    // El valor actual se muestra tal cual aunque el catálogo no lo liste.
    expect(platformInput()).toHaveValue('WII_U')

    await userEvent.click(platformInput())
    await waitFor(() => expect(optionTexts()).toContain('Wii U'))
    // Catálogo completo (3) + el valor legacy.
    expect(optionTexts()).toHaveLength(4)
  })
})
