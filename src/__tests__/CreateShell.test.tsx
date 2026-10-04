import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import CreateShell from '../components/CreateShell'

function renderShell(overrides: Partial<Parameters<typeof CreateShell>[0]> = {}) {
  return render(
    <MemoryRouter>
      <CreateShell
        crumbs={[{ label: 'Inicio', to: '/' }, { label: 'Libros', to: '/coleccion' }, { label: 'Añadir' }]}
        eyebrow="Libros"
        title="Añadir libro"
        subtitle="Añade un libro a tu colección."
        tabs={[
          { value: 'search', label: 'Buscar' },
          { value: 'manual', label: 'Manual' },
        ]}
        activeTab="search"
        onTabChange={vi.fn()}
        {...overrides}
      >
        <p>Contenido del formulario</p>
      </CreateShell>
    </MemoryRouter>,
  )
}

describe('CreateShell', () => {
  it('renderiza las migas con la última como página actual', () => {
    renderShell()

    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(crumbs).getByText('Inicio')).toBeInTheDocument()
    expect(within(crumbs).getByText('Libros')).toBeInTheDocument()
    expect(within(crumbs).getByText('Añadir')).toHaveAttribute('aria-current', 'page')
  })

  it('renderiza túítulo y subtítulo', () => {
    renderShell()

    expect(screen.getByRole('heading', { name: 'Añadir libro' })).toBeInTheDocument()
    expect(screen.getByText('Añade un libro a tu colección.')).toBeInTheDocument()
  })

  it('marca la pestaña activa con aria-selected', () => {
    renderShell()

    const searchTab = screen.getByRole('tab', { name: 'Buscar' })
    const manualTab = screen.getByRole('tab', { name: 'Manual' })
    expect(searchTab).toHaveAttribute('aria-selected', 'true')
    expect(manualTab).toHaveAttribute('aria-selected', 'false')
    expect(searchTab.className).toContain('on')
  })

  it('llama onTabChange al pulsar una pestaña inactiva', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    renderShell({ onTabChange })

    await user.click(screen.getByRole('tab', { name: 'Manual' }))

    expect(onTabChange).toHaveBeenCalledWith('manual')
  })

  it('envuelve el contenido en el form-panel', () => {
    const { container } = renderShell()

    expect(container.querySelector('.form-panel')).not.toBeNull()
    expect(screen.getByText('Contenido del formulario')).toBeInTheDocument()
  })

  it('no renderiza tablist si no hay tabs', () => {
    renderShell({ tabs: undefined, activeTab: undefined, onTabChange: undefined })

    expect(screen.queryByRole('tablist')).toBeNull()
  })
})