import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AmiiboCreatePage from '../pages/AmiiboCreatePage'
import { createAmiibo } from '../api/amiibosApi'

const { notify } = vi.hoisted(() => ({ notify: vi.fn() }))

vi.mock('../api/amiibosApi', () => ({ createAmiibo: vi.fn() }))
vi.mock('../components/Toast', () => ({ useToast: () => notify }))
vi.mock('../components/AmiiboSearch', () => ({ default: () => <p>Buscador Amiibo</p> }))
vi.mock('../components/AmiiboForm', () => ({
  default: ({ submitLabel, onSubmit }: { submitLabel: string; onSubmit: (p: unknown) => Promise<void> }) => (
    <button
      onClick={() => onSubmit({ externalId: 'manual-1', name: 'Mario', status: 'OWNED' })}
    >
      {submitLabel}
    </button>
  ),
}))

const mockedCreate = vi.mocked(createAmiibo)

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/figuras/amiibo/nuevo']}>
      <Routes>
        <Route path="/figuras/amiibo/nuevo" element={<AmiiboCreatePage />} />
        <Route path="/figuras/amiibo" element={<p>Listado Amiibo</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AmiiboCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedCreate.mockResolvedValue({ id: '1', name: 'Mario' } as never)
  })

  it('abre en modo búsqueda y renderiza el buscador', () => {
    renderPage()

    expect(screen.getByText('Buscador Amiibo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar Amiibo' })).not.toBeInTheDocument()
    expect(document.title).toBe('Añadir Amiibo — Collection')
  })

  it('cambiar a «Alta manual» renderiza el formulario', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Alta manual' }))

    expect(screen.getByRole('button', { name: 'Guardar Amiibo' })).toBeInTheDocument()
    expect(screen.queryByText('Buscador Amiibo')).not.toBeInTheDocument()
  })

  it('al guardar en modo manual llama a createAmiibo, notifica y navega', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Alta manual' }))
    await user.click(screen.getByRole('button', { name: 'Guardar Amiibo' }))

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mario', status: 'OWNED' }),
      ),
    )
    expect(notify).toHaveBeenCalledWith('Amiibo guardado.')
    expect(await screen.findByText('Listado Amiibo')).toBeInTheDocument()
  })
})
