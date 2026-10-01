import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CompleteGameDialog from '../components/CompleteGameDialog'

function renderDialog(
  dateValue?: string,
  ratingValue?: number,
  commentValue?: string,
  onSave = vi.fn(),
  onClose = vi.fn(),
) {
  return {
    onSave,
    onClose,
    ...render(
      <CompleteGameDialog
        dateValue={dateValue}
        ratingValue={ratingValue}
        commentValue={commentValue}
        onSave={onSave}
        onClose={onClose}
      />,
    ),
  }
}

describe('CompleteGameDialog', () => {
  it('propone hoy como fecha de fin por defecto', () => {
    renderDialog()
    expect(screen.getByLabelText(/Fecha de fin/)).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('precarga fecha, valoración y comentario existentes', () => {
    renderDialog('2025-03-15', 4, 'Obra maestra')
    expect(screen.getByLabelText(/Fecha de fin/)).toHaveValue('2025-03-15')
    expect(screen.getByRole('radio', { name: '4 estrellas' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('Comentario')).toHaveValue('Obra maestra')
  })

  it('guarda la fecha, la valoración y el comentario', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.clear(screen.getByLabelText(/Fecha de fin/))
    await user.type(screen.getByLabelText(/Fecha de fin/), '2025-06-01')
    await user.click(screen.getByRole('radio', { name: '4 estrellas' }))
    await user.type(screen.getByLabelText('Comentario'), 'Joya del metroidvania')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith('2025-06-01', 4, 'Joya del metroidvania')
  })

  it('una fecha vacía no guarda y avisa de que es obligatoria', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.clear(screen.getByLabelText(/Fecha de fin/))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('La fecha de fin es obligatoria.')
  })

  it('sin valoración ni comentario guarda con esos campos vacíos', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith(new Date().toISOString().slice(0, 10), 0, '')
  })

  it('Cancelar no guarda y cierra', async () => {
    const user = userEvent.setup()
    const { onSave, onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})