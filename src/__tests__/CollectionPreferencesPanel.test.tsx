import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CollectionPreferencesPanel from '../components/CollectionPreferencesPanel'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../api/preferencesApi', () => ({
  setActiveCollections: vi.fn(),
  setCollectionVisibility: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'
import { setActiveCollections, setCollectionVisibility } from '../api/preferencesApi'

const mockedUseAuth = vi.mocked(useAuth)
const mockedSetActive = vi.mocked(setActiveCollections)
const mockedSetVisibility = vi.mocked(setCollectionVisibility)

const prefs = {
  id: 'p1',
  userId: 'u1',
  activeCollections: { books: true, games: true, magic: false, decks: true, boardgames: true, movieshows: true },
  collectionVisibility: {
    books: 'PUBLIC',
    games: 'PUBLIC',
    magic: 'PUBLIC',
    decks: 'PUBLIC',
    boardgames: 'PUBLIC',
    movieshows: 'PUBLIC',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedUseAuth.mockReturnValue({
    user: { id: 'u1', username: 'javi', email: 'j@t.com' },
    accessToken: 'a',
    isAuthenticated: true,
    initializing: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    activeCollections: ['BOOKS'],
    preferences: prefs,
    refreshActiveCollections: vi.fn(),
    refreshPreferences: vi.fn(),
  } as any)
})

describe('CollectionPreferencesPanel', () => {
  it('muestra un toggle por colección con su visibilidad', () => {
    render(<CollectionPreferencesPanel />)
    expect(screen.getByLabelText('Libros')).toBeInTheDocument()
    expect(screen.getByLabelText('Visibilidad de Magic')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  it('guarda activos y visibilidad y muestra éxito', async () => {
    mockedSetActive.mockResolvedValue({} as never)
    mockedSetVisibility.mockResolvedValue({} as never)
    render(<CollectionPreferencesPanel />)

    await userEvent.click(screen.getByLabelText('Magic'))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(mockedSetActive).toHaveBeenCalledWith('u1', expect.objectContaining({ magic: true }))
    expect(mockedSetVisibility).toHaveBeenCalledWith('u1', expect.anything())
    expect(await screen.findByText('Preferencias guardadas.')).toBeInTheDocument()
  })

  it('muestra error si falla el guardado', async () => {
    mockedSetActive.mockRejectedValue(new Error('Error de red'))
    mockedSetVisibility.mockResolvedValue({} as never)
    render(<CollectionPreferencesPanel />)

    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Error de red')
  })
})
