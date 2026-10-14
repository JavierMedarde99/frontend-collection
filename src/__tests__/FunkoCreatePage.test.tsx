import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FunkoCreatePage from '../pages/FunkoCreatePage'
import { createFunko } from '../api/funkosApi'

const { notify } = vi.hoisted(() => ({ notify: vi.fn() }))

vi.mock('../api/funkosApi', () => ({ createFunko: vi.fn() }))
vi.mock('../components/Toast', () => ({ useToast: () => notify }))
vi.mock('../components/FunkoSearch', () => ({ default: () => <p>Buscador Funko</p> }))
vi.mock('../components/FunkoForm', () => ({
  default: ({ submitLabel, onSubmit }: { submitLabel: string; onSubmit: (p: unknown) => Promise<void> }) => (
    <button
      onClick={() => onSubmit({ externalId: 'manual-1', name: 'Batman', status: 'OWNED' })}
    >
      {submitLabel}
    </button>
  ),
}))

const mockedCreate = vi.mocked(createFunko)

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/figuras/funkopop/nuevo']}>
      <Routes>
        <Route path="/figuras/funkopop/nuevo" element={<FunkoCreatePage />} />
        <Route path="/figuras/funkopop" element={<p>Listado Funko</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FunkoCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedCreate.mockResolvedValue({ id: '1', name: 'Batman' } as never)
  })

  it('abre en modo búsqueda y renderiza el buscador', () => {
    renderPage()

    expect(screen.getByText('Buscador Funko')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar Funko' })).not.toBeInTheDocument()
    expect(document.title).toBe('Añadir Funko Pop — Collection')
  })

  it('cambiar a «Alta manual» renderiza el formulario', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Alta manual' }))

    expect(screen.getByRole('button', { name: 'Guardar Funko' })).toBeInTheDocument()
    expect(screen.queryByText('Buscador Funko')).not.toBeInTheDocument()
  })

  it('al guardar en modo manual llama a createFunko, notifica y navega', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Alta manual' }))
    await user.click(screen.getByRole('button', { name: 'Guardar Funko' }))

    await waitFor(() =>
      expect(mockedCreate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Batman', status: 'OWNED' }),
      ),
    )
    expect(notify).toHaveBeenCalledWith('Funko Pop guardado.')
    expect(await screen.findByText('Listado Funko')).toBeInTheDocument()
  })
})
