import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import StartReadingDialog from '../components/StartReadingDialog'

function renderDialog(pages: number | undefined, onSave = vi.fn(), onClose = vi.fn()) {
  return {
    onSave,
    onClose,
    ...render(
      <StartReadingDialog pages={pages} onSave={onSave} onClose={onClose} />,
    ),
  }
}

describe('StartReadingDialog', () => {
  it('pide las páginas leídas y devuelve el valor', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog(412)

    await user.type(screen.getByLabelText('Nº de páginas leídas'), '40')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith(40)
  })

  it('arranca con 0 páginas', () => {
    renderDialog(412)
    expect(screen.getByLabelText('Nº de páginas leídas')).toHaveValue(0)
  })

  it('no deja superar el total de páginas', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog(412)

    const input = screen.getByLabelText('Nº de páginas leídas')
    await user.clear(input)
    await user.type(input, '500')

    expect(screen.getByText('No puede exceder el total de páginas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('sin total de páginas acepta cualquier número (opción A)', async () => {
    const user = userEvent.setup()
    const { onSave } = renderDialog(undefined)

    const input = screen.getByLabelText('Nº de páginas leídas')
    await user.clear(input)
    await user.type(input, '37')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith(37)
  })

  it('sin total de páginas no muestra el subtítulo del total', () => {
    renderDialog(undefined)
    expect(screen.queryByText(/páginas en total/)).not.toBeInTheDocument()
  })

  it('Cancelar no guarda y cierra', async () => {
    const user = userEvent.setup()
    const { onSave, onClose } = renderDialog(412)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
