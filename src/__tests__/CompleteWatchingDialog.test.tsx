import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CompleteWatchingDialog from '../components/CompleteWatchingDialog'

describe('CompleteWatchingDialog', () => {
  it('propone hoy como fecha de fin', () => {
    const onSave = vi.fn()
    render(<CompleteWatchingDialog dateValue={undefined} ratingValue={0} commentValue="" onSave={onSave} onClose={vi.fn()} />)
    expect(screen.getByLabelText(/Fecha de fin/)).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('no deja guardar sin fecha de fin', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<CompleteWatchingDialog dateValue={undefined} ratingValue={0} commentValue="" onSave={onSave} onClose={vi.fn()} />)

    await user.clear(screen.getByLabelText(/Fecha de fin/))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de fin es obligatoria.')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('no deja guardar sin valoración (estrellas)', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<CompleteWatchingDialog dateValue={undefined} ratingValue={0} commentValue="" onSave={onSave} onClose={vi.fn()} />)

    await user.clear(screen.getByLabelText(/Fecha de fin/))
    await user.type(screen.getByLabelText(/Fecha de fin/), '2024-03-20')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La valoración es obligatoria.')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('al guardar envía fecha, valoración y comentario', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<CompleteWatchingDialog dateValue={undefined} ratingValue={0} commentValue="" onSave={onSave} onClose={vi.fn()} />)

    // Set date
    await user.clear(screen.getByLabelText(/Fecha de fin/))
    await user.type(screen.getByLabelText(/Fecha de fin/), '2024-03-20')
    // Click on the 4th star (rating = 4)
    const stars = screen.getAllByRole('radio', { name: /estrella/i })
    await user.click(stars[3])
    await user.type(screen.getByLabelText(/Comentario/), 'Me encantó')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(onSave).toHaveBeenCalledWith('2024-03-20', 4, 'Me encantó')
  })
})