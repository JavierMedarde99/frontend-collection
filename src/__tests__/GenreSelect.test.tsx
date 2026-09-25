import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GenreSelect from '../components/GenreSelect'

const OPTIONS = ['Fantasía', 'Terror']

describe('GenreSelect', () => {
  it('alterna chips al pulsar', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<GenreSelect options={OPTIONS} value={[]} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Fantasía' }))
    expect(onChange).toHaveBeenCalledWith(['Fantasía'])
  })

  it('desmarca un género activo', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<GenreSelect options={OPTIONS} value={['Terror']} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Terror' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Terror' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('añade género personalizado con el botón', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<GenreSelect options={OPTIONS} value={[]} onChange={onChange} />)
    await user.type(screen.getByLabelText('Añadir género personalizado'), 'Space opera')
    await user.click(screen.getByRole('button', { name: 'Añadir' }))
    expect(onChange).toHaveBeenCalledWith(['Space opera'])
  })

  it('no duplica personalizados insensibles a mayúsculas', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<GenreSelect options={OPTIONS} value={['Fantasía']} onChange={onChange} />)
    await user.type(screen.getByLabelText('Añadir género personalizado'), 'fantasía')
    await user.click(screen.getByRole('button', { name: 'Añadir' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('muestra los personalizados ya elegidos como chips', () => {
    render(<GenreSelect options={OPTIONS} value={['Space opera']} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Space opera' })).toHaveAttribute('aria-pressed', 'true')
  })
})
