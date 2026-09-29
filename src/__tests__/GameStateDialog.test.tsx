import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GameStateDialog from '../components/GameStateDialog'

function renderDialog(dateValue?: string, onSave = vi.fn(), onClose = vi.fn()) {
  return {
    onSave,
    onClose,
    ...render(
      <GameStateDialog
        title="¡A jugar!"
        description="El videojuego pasará a «Jugando»."
        dateLabel="Fecha de inicio"
        dateValue={dateValue}
        onSave={onSave}
        onClose={onClose}
      />,
    ),
  }
}

describe('GameStateDialog', () => {
  it('propone hoy como fecha por defecto', () => {
    renderDialog()
    expect(screen.getByLabelText(/Fecha de inicio/)).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('precarga la fecha que ya tenía el videojuego', () => {
    renderDialog('2025-03-15')
    expect(screen.getByLabelText(/Fecha de inicio/)).toHaveValue('2025-03-15')
  })

  it('muestra título y descripción', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: '¡A jugar!' })).toBeInTheDocument()
    expect(screen.getByText('El videojuego pasará a «Jugando».')).toBeInTheDocument()
  })

  it('guarda la fecha elegida', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.clear(screen.getByLabelText(/Fecha de inicio/))
    await user.type(screen.getByLabelText(/Fecha de inicio/), '2025-06-01')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith('2025-06-01')
  })

  it('una fecha vacía no guarda y avisa de que es obligatoria', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog()

    await user.clear(screen.getByLabelText(/Fecha de inicio/))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('La fecha de inicio es obligatoria.')
  })

  it('Cancelar no guarda y cierra', async () => {
    const user = userEvent.setup()
    const { onSave, onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})