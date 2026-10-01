import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StartWatchingDialog from '../components/StartWatchingDialog'

describe('StartWatchingDialog', () => {
  it('propone hoy como fecha de inicio', () => {
    const onSave = vi.fn()
    render(<StartWatchingDialog dateValue={undefined} onSave={onSave} onClose={vi.fn()} />)
    expect(screen.getByLabelText(/Fecha de inicio/)).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('muestra fecha existente si la tiene', () => {
    const onSave = vi.fn()
    render(<StartWatchingDialog dateValue="2024-03-15" onSave={onSave} onClose={vi.fn()} />)
    expect(screen.getByLabelText(/Fecha de inicio/)).toHaveValue('2024-03-15')
  })

  it('no deja guardar sin fecha de inicio', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<StartWatchingDialog dateValue={undefined} onSave={onSave} onClose={vi.fn()} />)

    await user.clear(screen.getByLabelText(/Fecha de inicio/))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de inicio es obligatoria.')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('al guardar envía la fecha de inicio', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<StartWatchingDialog dateValue={undefined} onSave={onSave} onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
  })
})