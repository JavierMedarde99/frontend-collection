import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ListSearchInput from '../components/ListSearchInput'

describe('ListSearchInput', () => {
  it('muestra el contador de coincidencias sobre el total cuando hay filtro', () => {
    render(
      <ListSearchInput value="cat" onChange={vi.fn()} count={3} total={12} placeholder="Buscar" ariaLabel="Buscar en la lista" />,
    )

    expect(screen.getByRole('searchbox', { name: 'Buscar en la lista' })).toBeInTheDocument()
    expect(screen.getByText('3 de 12')).toBeInTheDocument()
  })

  it('sin filtro muestra solo el total', () => {
    render(
      <ListSearchInput value="" onChange={vi.fn()} count={12} total={12} placeholder="Buscar" ariaLabel="Buscar en la lista" />,
    )

    expect(screen.getByText('12 en total')).toBeInTheDocument()
  })

  it('avisa cuando el filtro no deja ninguna fila', () => {
    render(
      <ListSearchInput value="zzz" onChange={vi.fn()} count={0} total={12} placeholder="Buscar" ariaLabel="Buscar en la lista" />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(/no hay coincidencias/i)
  })

  it('no muestra el aviso cuando hay coincidencias', () => {
    render(
      <ListSearchInput value="cat" onChange={vi.fn()} count={2} total={12} placeholder="Buscar" ariaLabel="Buscar en la lista" />,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('propaga lo que se escribe', async () => {
    const onChange = vi.fn()
    render(
      <ListSearchInput value="" onChange={onChange} count={12} total={12} placeholder="Buscar" ariaLabel="Buscar en la lista" />,
    )

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar en la lista' }), 'cat')

    expect(onChange).toHaveBeenCalledWith('c')
    expect(onChange).toHaveBeenCalledTimes(3)
  })
})
