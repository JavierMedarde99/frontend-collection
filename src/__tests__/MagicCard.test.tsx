import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MagicCard from '../components/MagicCard'
import type { MagicCardResponse } from '../types'

function cardWith(overrides: Partial<MagicCardResponse> = {}): MagicCardResponse {
  return { id: 'mc1', name: 'Lightning Bolt', ...overrides }
}

interface RenderOptions {
  card?: Partial<MagicCardResponse>
  onAddCopies?: (quantity: number) => Promise<void>
  readOnly?: boolean
}

function renderCard(options: RenderOptions = {}) {
  const onDelete = vi.fn().mockResolvedValue(undefined)
  render(
    <MemoryRouter>
      <MagicCard
        card={cardWith(options.card)}
        onDelete={onDelete}
        onAddCopies={options.onAddCopies}
        readOnly={options.readOnly}
      />
    </MemoryRouter>,
  )
  return { onDelete }
}

describe('MagicCard contador de copias', () => {
  it('muestra x1 cuando solo hay una copia', () => {
    renderCard({ card: { quantity: 1 } })

    expect(screen.getByText('x1')).toBeInTheDocument()
  })

  it('muestra xN cuando hay varias copias', () => {
    renderCard({ card: { quantity: 4 } })

    expect(screen.getByText('x4')).toBeInTheDocument()
  })

  it('no muestra contador si la cantidad no está definida', () => {
    renderCard({ card: { quantity: undefined } })

    expect(screen.queryByText(/^x\d+$/)).toBeNull()
  })
})

describe('MagicCard añadir copias', () => {
  it('muestra el botón cuando se pasa el handler', () => {
    renderCard({ onAddCopies: vi.fn() })

    expect(screen.getByRole('button', { name: /añadir copias/i })).toBeInTheDocument()
  })

  it('no muestra el botón sin handler', () => {
    renderCard()

    expect(screen.queryByRole('button', { name: /añadir copias/i })).toBeNull()
  })

  it('no muestra el botón en modo lectura', () => {
    renderCard({ onAddCopies: vi.fn(), readOnly: true })

    expect(screen.queryByRole('button', { name: /añadir copias/i })).toBeNull()
  })

  it('al confirmar llama al handler con el número indicado', async () => {
    const onAddCopies = vi.fn().mockResolvedValue(undefined)
    renderCard({ onAddCopies })

    fireEvent.click(screen.getByRole('button', { name: /añadir copias/i }))
    fireEvent.change(screen.getByLabelText(/copias a añadir/i), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    await waitFor(() => expect(onAddCopies).toHaveBeenCalledWith(3))
  })

  it('muestra un error si el handler falla y no cierra el formulario', async () => {
    const onAddCopies = vi.fn().mockRejectedValue(new Error('Sin conexión'))
    renderCard({ onAddCopies })

    fireEvent.click(screen.getByRole('button', { name: /añadir copias/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión')
    expect(screen.getByLabelText(/copias a añadir/i)).toBeInTheDocument()
  })
})
