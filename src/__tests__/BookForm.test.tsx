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
    render(<BookForm isCreate submitLabel="Guardar" onSubmit={onSubmit} />)

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
    render(
      <BookForm
        submitLabel="Guardar"
        onSubmit={onSubmit}
        initial={{ acquisitionDate: '2024-01-01', startDate: '2024-02-01' }}
      />,
    )

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
    render(
      <BookForm
        submitLabel="Guardar"
        onSubmit={onSubmit}
        initial={{ acquisitionDate: '2024-01-01', startDate: '2024-02-01' }}
      />,
    )

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
        initial={{
          state: BookState.COMPLETED,
          pagesRead: 60,
          acquisitionDate: '2024-01-01',
          startDate: '2024-02-01',
          endDate: '2024-03-01',
        }}
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
    render(<BookForm isCreate submitLabel="Guardar" onSubmit={onSubmit} />)

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

  it('en WISHLIST no exige el nº de páginas', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.WISHLIST)
    await user.type(screen.getByPlaceholderText('Título del libro'), 'Neuromante')
    await user.type(screen.getByPlaceholderText('Autor'), 'William Gibson')
    await user.click(screen.getByRole('button', { name: 'Guardar libro' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ state: BookState.WISHLIST })
    expect(onSubmit.mock.calls[0]![0]).not.toHaveProperty('pages')
  })

  it('en WISHLIST no muestra los campos de adquisición ni fechas de lectura', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(
      <BookForm submitLabel="Guardar" onSubmit={onSubmit} initial={{ state: BookState.WISHLIST }} />,
    )
    expect(screen.queryByPlaceholderText('12.50')).not.toBeInTheDocument()
    expect(container.querySelector('input[type="date"]')).toBeNull()
  })

  it('en WISHLIST no envía la fecha de obtención aunque exista', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <BookForm
        isCreate
        submitLabel="Guardar libro"
        onSubmit={onSubmit}
        initial={{ state: BookState.WISHLIST, acquisitionDate: '2024-01-01', acquisitionPrice: 10 }}
      />,
    )

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Neuromante')
    await user.type(screen.getByPlaceholderText('Autor'), 'William Gibson')
    await user.click(screen.getByRole('button', { name: 'Guardar libro' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).not.toHaveProperty('acquisitionDate')
    expect(onSubmit.mock.calls[0]![0]).not.toHaveProperty('acquisitionPrice')
  })

  it('envía editorial, año, ISBN y adquisición en el payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.type(screen.getByPlaceholderText('Ej: Alfaguara'), 'Alfaguara')
    await user.type(screen.getByPlaceholderText('Ej: 1995'), '1965')
    await user.type(screen.getByPlaceholderText('9788437604947'), '9788437604947')
    await user.type(screen.getByPlaceholderText('12.50'), '12.5')
    await user.click(screen.getByRole('button', { name: 'Guardar libro' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      publisher: 'Alfaguara',
      publicationYear: 1965,
      isbn: '9788437604947',
      acquisitionPrice: 12.5,
    })
  })

  it('al crear propone hoy como fecha de obtención', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={onSubmit} />)
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput).toHaveValue(new Date().toISOString().slice(0, 10))
  })

  it('al crear con COMPLETED propone hoy como fecha de inicio y de fin', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.COMPLETED)
    // Orden en el DOM: obtención, inicio, fin.
    const dates = container.querySelectorAll('input[type="date"]')
    expect(dates).toHaveLength(3)
    const today = new Date().toISOString().slice(0, 10)
    expect(dates[0]).toHaveValue(today)
    expect(dates[1]).toHaveValue(today)
    expect(dates[2]).toHaveValue(today)
  })

  it('al editar no inventa la fecha de obtención: la deja vacía y la exige', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(
      <BookForm submitLabel="Guardar" onSubmit={onSubmit} initial={{ acquisitionDate: undefined }} />,
    )
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput).toHaveValue('')

    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de obtención es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('no deja enviar COMPLETED sin fecha de fin', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Por leer'), BookState.COMPLETED)
    await user.clear(container.querySelectorAll('input[type="date"]')[2]!)
    await user.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await user.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await user.type(screen.getByPlaceholderText('120'), '412')
    await user.click(screen.getByRole('button', { name: 'Guardar libro' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('La fecha de fin es obligatoria.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('un libro en posesión precarga los datos de adquisición', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { container } = render(
      <BookForm
        submitLabel="Guardar"
        onSubmit={onSubmit}
        initial={{ acquisitionDate: '2024-03-15', acquisitionPrice: 12.5 }}
      />,
    )
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput).toHaveValue('2024-03-15')
    expect(screen.getByPlaceholderText('12.50')).toHaveValue(12.5)
  })
})