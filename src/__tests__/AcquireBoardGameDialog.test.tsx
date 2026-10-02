import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AcquireBoardGameDialog from '../components/AcquireBoardGameDialog'

describe('AcquireBoardGameDialog', () => {
  it('no pide número de jugadas ni fecha de la última jugada', () => {
    render(<AcquireBoardGameDialog onSave={vi.fn()} onClose={vi.fn()} />)

    expect(screen.queryByLabelText('Número de jugadas')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Última jugada')).not.toBeInTheDocument()
  })

  it('al guardar envía fecha y precio sin jugadas ni última jugada', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<AcquireBoardGameDialog onSave={onSave} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/Precio de adquisición/), '24.99')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith({
      dateAdded: new Date().toISOString().slice(0, 10),
      acquisitionPrice: 24.99,
      difficulty: undefined,
      personalRating: undefined,
      notes: undefined,
    })
  })

  it('es válido guardar con precio 0 y sin haber jugado nunca', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<AcquireBoardGameDialog onSave={onSave} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/Precio de adquisición/), '0')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalled()
  })
})