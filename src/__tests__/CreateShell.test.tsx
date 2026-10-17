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

  it('asocia las pestañas con un tabpanel (role, aria-controls y aria-labelledby)', () => {
    const { container } = renderShell()

    const panel = container.querySelector('.form-panel') as HTMLElement
    expect(panel).toHaveAttribute('role', 'tabpanel')
    expect(panel).toHaveAttribute('tabindex', '0')

    const searchTab = screen.getByRole('tab', { name: 'Buscar' })
    const manualTab = screen.getByRole('tab', { name: 'Manual' })
    expect(searchTab).toHaveAttribute('aria-controls', panel.id)
    expect(manualTab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', searchTab.id)
  })

  it('usa roving tabindex: solo la pestaña activa es tabulable', () => {
    renderShell()

    expect(screen.getByRole('tab', { name: 'Buscar' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Manual' })).toHaveAttribute('tabindex', '-1')
  })

  it('navega con flechas y Home/End, llamando a onTabChange', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    const { rerender } = renderShell({ onTabChange })
    const searchTab = screen.getByRole('tab', { name: 'Buscar' })

    searchTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(onTabChange).toHaveBeenLastCalledWith('manual')

    rerender(
      <MemoryRouter>
        <CreateShell
          crumbs={[{ label: 'Añadir' }]}
          eyebrow="Libros"
          title="Añadir libro"
          tabs={[
            { value: 'search', label: 'Buscar' },
            { value: 'manual', label: 'Manual' },
          ]}
          activeTab="manual"
          onTabChange={onTabChange}
        >
          <p>Contenido del formulario</p>
        </CreateShell>
      </MemoryRouter>,
    )

    screen.getByRole('tab', { name: 'Manual' }).focus()
    await user.keyboard('{Home}')
    expect(onTabChange).toHaveBeenLastCalledWith('search')

    screen.getByRole('tab', { name: 'Buscar' }).focus()
    await user.keyboard('{End}')
    expect(onTabChange).toHaveBeenLastCalledWith('manual')
  })
})