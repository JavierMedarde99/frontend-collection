import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import BoardGameForm from '../components/BoardGameForm'

function renderForm(options: { isCreate?: boolean; initial?: Record<string, unknown> } = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const utils = render(
    <MemoryRouter>
      <BoardGameForm
        submitLabel="Guardar juego"
        onSubmit={onSubmit}
        isCreate={options.isCreate}
        initial={options.initial as never}
      />
    </MemoryRouter>,
  )
  return { onSubmit, ...utils }
}

describe('BoardGameForm fechas obligatorias', () => {
  it('al crear propone hoy como fecha de adición', () => {
    const { container } = renderForm({ isCreate: true })
    const dates = container.querySelectorAll('input[type="date"]')
    // [0] = fecha de adición, [1] = última jugada
    expect(dates).toHaveLength(2)
    expect(dates[0]).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('no deja crear sin fecha de adición', async () => {
    const user = userEvent.setup()
    const { onSubmit, container } = renderForm({ isCreate: true })

    await user.clear(container.querySelectorAll('input[type="date"]')[0]!)
    await user.type(screen.getByPlaceholderText('Título del juego'), 'Catan')
    await user.type(screen.getByPlaceholderText('24.99'), '19.99')
    await user.click(screen.getByRole('button', { name: 'Guardar juego' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de adición es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('no deja guardar con jugadas si falta la última jugada', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ isCreate: true })

    await user.type(screen.getByPlaceholderText('Título del juego'), 'Catan')
    await user.type(screen.getByPlaceholderText('24.99'), '19.99')
    await user.type(screen.getByPlaceholderText('Ej: 12'), '5')
    await user.click(screen.getByRole('button', { name: 'Guardar juego' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de la última jugada es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('permite guardar sin jugadas aunque falte la última jugada', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm({ isCreate: true })

    await user.type(screen.getByPlaceholderText('Título del juego'), 'Catan')
    await user.type(screen.getByPlaceholderText('24.99'), '19.99')
    await user.click(screen.getByRole('button', { name: 'Guardar juego' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0]![0] as Record<string, unknown>
    expect(payload.title).toBe('Catan')
    expect(payload.dateAdded).toBe(new Date().toISOString().slice(0, 10))
    expect(payload.lastPlayedDate).toBeUndefined()
    expect(payload.acquisitionPrice).toBe(19.99)
  })

  it('envía la última jugada cuando hay jugadas', async () => {
    const user = userEvent.setup()
    const { onSubmit, container } = renderForm({ isCreate: true })

    await user.type(screen.getByPlaceholderText('Título del juego'), 'Catan')
    await user.type(screen.getByPlaceholderText('24.99'), '19.99')
    await user.type(screen.getByPlaceholderText('Ej: 12'), '5')
    await user.type(container.querySelectorAll('input[type="date"]')[1]!, '2024-01-02')
    await user.click(screen.getByRole('button', { name: 'Guardar juego' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0]![0] as Record<string, unknown>
    expect(payload.title).toBe('Catan')
    expect(payload.playCount).toBe(5)
    expect(payload.lastPlayedDate).toBe('2024-01-02')
    expect(payload.acquisitionPrice).toBe(19.99)
  })
})