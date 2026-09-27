import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MarkAsOwnedDialog from '../components/MarkAsOwnedDialog'

function renderDialog(acquisitionDate?: string, onSave = vi.fn(), onClose = vi.fn()) {
  return {
    onSave,
    onClose,
    ...render(<MarkAsOwnedDialog acquisitionDate={acquisitionDate} onSave={onSave} onClose={onClose} />),
  }
}

describe('MarkAsOwnedDialog', () => {
  it('prellena la fecha de obtención con hoy', () => {
    renderDialog()
    expect(screen.getByLabelText('Fecha de obtención')).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('usa la fecha de obtención que ya tenía el libro', () => {
    renderDialog('2024-03-15')
    expect(screen.getByLabelText('Fecha de obtención')).toHaveValue('2024-03-15')
  })

  it('devuelve la fecha elegida', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog('2024-03-15')

    const input = screen.getByLabelText('Fecha de obtención')
    await user.clear(input)
    await user.type(input, '2025-06-01')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith('2025-06-01')
  })

  it('una fecha vacía se guarda como undefined', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.clear(screen.getByLabelText('Fecha de obtención'))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith(undefined)
  })

  it('Cancelar no guarda y cierra', async () => {
    const user = userEvent.setup()
    const { onSave, onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
