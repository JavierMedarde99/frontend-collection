import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MarkAsOwnedDialog from '../components/MarkAsOwnedDialog'

function renderDialog(
  acquisitionDate?: string,
  acquisitionPrice?: number,
  onSave = vi.fn(),
  onClose = vi.fn(),
) {
  return {
    onSave,
    onClose,
    ...render(
      <MarkAsOwnedDialog
        acquisitionDate={acquisitionDate}
        acquisitionPrice={acquisitionPrice}
        onSave={onSave}
        onClose={onClose}
      />,
    ),
  }
}

describe('MarkAsOwnedDialog', () => {
  it('prellena la fecha de obtención con hoy', () => {
    renderDialog()
    expect(screen.getByLabelText(/Fecha de obtención/)).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('usa la fecha de obtención que ya tenía el libro', () => {
    renderDialog('2024-03-15')
    expect(screen.getByLabelText(/Fecha de obtención/)).toHaveValue('2024-03-15')
  })

  it('muestra un campo para el precio de adquisición', () => {
    renderDialog()
    expect(screen.getByLabelText(/Precio de adquisición/)).toBeInTheDocument()
  })

  it('devuelve la fecha y el precio elegidos', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog('2024-03-15')

    await user.clear(screen.getByLabelText(/Fecha de obtención/))
    await user.type(screen.getByLabelText(/Fecha de obtención/), '2025-06-01')
    await user.type(screen.getByLabelText(/Precio de adquisición/), '12.50')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith('2025-06-01', 12.5)
  })

  it('un precio vacío no guarda y avisa de que es obligatorio', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog('2024-03-15')

    await user.type(screen.getByLabelText(/Precio de adquisición/), '9')
    await user.clear(screen.getByLabelText(/Precio de adquisición/))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('El precio es obligatorio.')
  })

  it('un precio de 0 sigue siendo válido', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.type(screen.getByLabelText(/Precio de adquisición/), '0')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith(new Date().toISOString().slice(0, 10), 0)
  })

  it('una fecha vacía no guarda y avisa de que es obligatoria', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.type(screen.getByLabelText(/Precio de adquisición/), '12.50')
    await user.clear(screen.getByLabelText(/Fecha de obtención/))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('La fecha de obtención es obligatoria.')
  })

  it('rellenar la fecha tras el error vuelve a permitir guardar', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.type(screen.getByLabelText(/Precio de adquisición/), '12.50')
    await user.clear(screen.getByLabelText(/Fecha de obtención/))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await user.type(screen.getByLabelText(/Fecha de obtención/), '2025-06-01')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith('2025-06-01', 12.5)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('Cancelar no guarda y cierra', async () => {
    const user = userEvent.setup()
    const { onSave, onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})