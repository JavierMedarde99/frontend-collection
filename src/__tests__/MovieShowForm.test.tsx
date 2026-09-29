import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MovieShowForm from '../components/MovieShowForm'
import { MovieShowStatus } from '../types/MovieShowStatus'

function renderForm(options: { isCreate?: boolean; initial?: Record<string, unknown> } = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const utils = render(
    <MemoryRouter>
      <MovieShowForm
        submitLabel="Guardar película/serie"
        onSubmit={onSubmit}
        isCreate={options.isCreate}
        initial={options.initial as never}
      />
    </MemoryRouter>,
  )
  return { onSubmit, ...utils }
}

describe('MovieShowForm fechas obligatorias', () => {
  it('al crear propone hoy como fecha de inicio y de fin en Visto', async () => {
    const { container } = renderForm({ isCreate: true })

    await userEvent.selectOptions(screen.getByDisplayValue('Plan para ver'), MovieShowStatus.WATCHED)
    const dates = container.querySelectorAll('input[type="date"]')
    // releaseDate (opcional) + dateAdded + dateCompleted
    expect(dates).toHaveLength(3)
    const today = new Date().toISOString().slice(0, 10)
    expect(dates[1]).toHaveValue(today)
    expect(dates[2]).toHaveValue(today)
  })

  it('no deja enviar Viendo sin fecha de inicio', async () => {
    const { onSubmit, container } = renderForm({ isCreate: true })

    await userEvent.selectOptions(screen.getByDisplayValue('Plan para ver'), MovieShowStatus.WATCHING)
    await userEvent.clear(container.querySelectorAll('input[type="date"]')[1]!)
    await userEvent.type(screen.getByPlaceholderText('Título'), 'Dune')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar película/serie' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de inicio es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('no deja enviar Visto sin fecha de fin', async () => {
    const { onSubmit, container } = renderForm({ isCreate: true })

    await userEvent.selectOptions(screen.getByDisplayValue('Plan para ver'), MovieShowStatus.WATCHED)
    await userEvent.clear(container.querySelectorAll('input[type="date"]')[2]!)
    await userEvent.type(screen.getByPlaceholderText('Título'), 'Dune')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar película/serie' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de fin es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('al editar no inventa las fechas y exige la de inicio en Viendo', async () => {
    const { onSubmit, container } = renderForm({
      initial: { status: MovieShowStatus.WATCHING, dateAdded: undefined },
    })

    const dates = container.querySelectorAll('input[type="date"]')
    expect(dates[1]).toHaveValue('')
    await userEvent.type(screen.getByPlaceholderText('Título'), 'Dune')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar película/serie' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de inicio es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('releaseDate se mantiene opcional (campo sin marca de obligatorio)', () => {
    const { container } = renderForm({ isCreate: true })
    // El campo de estreno no muestra el asterisco de requerido del resto.
    const releaseSection = container.querySelector('input[type="date"]')!.closest('div')!
    expect(releaseSection.querySelector('.text-brand')).toBeNull()
  })
})