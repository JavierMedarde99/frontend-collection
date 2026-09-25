import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BookForm from '../components/BookForm'
import { BookState } from '../types/BookState'
import { BookType } from '../types/BookType'
import type { BookFormData } from '../types/Api'

describe('BookForm', () => {
  it('rechaza el envío sin título', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('El título es obligatorio.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rechaza el envío sin autor', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('El autor es obligatorio.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía los datos rellenados', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const payload = onSubmit.mock.calls[0]![0] as BookFormData
    expect(payload.title).toBe('Dune')
    expect(payload.author).toBe('Frank Herbert')
    expect(payload.pages).toBe(412)
    expect(payload.type).toBe(BookType.NOVEL)
    expect(payload.state).toBe(BookState.TO_READ)
  })

  it('rechaza el envío sin páginas', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('nº de páginas es obligatorio')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra los campos de estado completado al seleccionarlo', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    expect(screen.queryByText('Valoración')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.COMPLETED)

    expect(screen.getByText('Fecha de inicio')).toBeInTheDocument()
    expect(screen.getByText('Fecha de fin')).toBeInTheDocument()
    expect(screen.getByText('Valoración')).toBeInTheDocument()
    expect(screen.getByText('Comentario')).toBeInTheDocument()
  })

  it('no muestra la valoración ni comentario en estado leyendo', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.READING)
    expect(screen.queryByText('Valoración')).not.toBeInTheDocument()
    expect(screen.queryByText('Comentario')).not.toBeInTheDocument()
  })

  it('muestra el error externo recibido por props', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} error="No se pudo guardar." />)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar.')
  })

  it('en TO_READ no muestra páginas leídas', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)
    expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()
  })

  it('en READING muestra el campo y lo envía en el payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.READING)
    await user.type(screen.getByPlaceholderText('0'), '50')
    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ pagesRead: 50 })
  })

  it('avisa cuando las páginas leídas exceden el total', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.READING)
    await user.type(screen.getByPlaceholderText('120'), '100')
    await user.type(screen.getByPlaceholderText('0'), '150')
    expect(screen.getByText(/No puede exceder el total de páginas/)).toBeInTheDocument()
  })

  it('al pasar a Por leer resetea las páginas leídas', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.READING)
    await user.type(screen.getByPlaceholderText('0'), '50')
    await user.selectOptions(screen.getByDisplayValue('Leyendo'), BookState.TO_READ)
    expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).not.toHaveProperty('pagesRead')
  })

  it('en COMPLETED conserva las páginas leídas en el payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <BookForm
        submitLabel="Guardar"
        onSubmit={onSubmit}
        initial={{ state: BookState.COMPLETED, pagesRead: 60 }}
      />,
    )
    expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ pagesRead: 60 })
  })

  it('en creación no muestra páginas leídas aunque el estado sea leyendo', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.READING)
    expect(screen.queryByPlaceholderText('0')).not.toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.click(screen.getByRole('button', { name: 'Guardar libro' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).not.toHaveProperty('pagesRead')
  })

  it('envía los géneros seleccionados en el payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Fantasía' }))
    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ genres: ['Fantasía'] })
  })

  it('precarga los géneros al editar', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm submitLabel="Guardar" onSubmit={onSubmit} initial={{ genres: ['Terror'] }} />)
    expect(screen.getByRole('button', { name: 'Terror' })).toHaveAttribute('aria-pressed', 'true')
  })
})