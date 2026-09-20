import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BookForm from '../components/BookForm'

const scanStore = vi.hoisted(() => ({ onSuccess: null as ((d: string) => void) | null }))

vi.mock('html5-qrcode', () => {
  class MockHtml5Qrcode {
    start = vi.fn((_c: unknown, _o: unknown, ok: (d: string) => void) => {
      scanStore.onSuccess = ok
      return Promise.resolve()
    })
    stop = vi.fn(() => Promise.resolve())
    clear = vi.fn(() => Promise.resolve())
  }
  return { Html5Qrcode: MockHtml5Qrcode }
})

vi.mock('../api/booksApi', () => ({
  searchBooksByIsbn: vi.fn(),
}))

import { searchBooksByIsbn } from '../api/booksApi'

const mockedIsbnSearch = vi.mocked(searchBooksByIsbn)

beforeEach(() => {
  scanStore.onSuccess = null
  vi.clearAllMocks()
})

describe('BookForm escaneo ISBN', () => {
  it('abre el modal al pulsar Escanear ISBN', async () => {
    render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Escanear ISBN' }))
    expect(screen.getByRole('dialog', { name: 'Escanear ISBN' })).toBeInTheDocument()
  })

  it('rellena el ISBN y busca automáticamente al detectar', async () => {
    mockedIsbnSearch.mockResolvedValue({ content: [], totalPages: 0 } as never)
    render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Escanear ISBN' }))
    await waitFor(() => expect(scanStore.onSuccess).not.toBeNull())

    scanStore.onSuccess!('9788498382671')

    expect(await screen.findByDisplayValue('9788498382671')).toBeInTheDocument()
    expect(mockedIsbnSearch).toHaveBeenCalledWith('9788498382671', 0, 5)
    expect(screen.queryByRole('dialog', { name: 'Escanear ISBN' })).not.toBeInTheDocument()
  })

  it('ofrece Usar para pre-rellenar desde el resultado', async () => {
    mockedIsbnSearch.mockResolvedValue({
      content: [{
        id: 'g1',
        title: 'Dune',
        authors: ['Frank Herbert'],
        pageCount: 412,
        coverImage: 'http://img/dune.jpg',
        description: 'Ciencia ficción.',
      }],
      totalPages: 1,
    } as never)
    render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Escanear ISBN' }))
    await waitFor(() => expect(scanStore.onSuccess).not.toBeNull())
    scanStore.onSuccess!('9788498382671')

    await userEvent.click(await screen.findByRole('button', { name: 'Usar' }))

    expect(screen.getByDisplayValue('Dune')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Frank Herbert')).toBeInTheDocument()
  })

  it('envía el isbn en el payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BookForm isCreate submitLabel="Guardar libro" onSubmit={onSubmit} />)
    await userEvent.type(screen.getByPlaceholderText('Título del libro'), 'Dune')
    await userEvent.type(screen.getByPlaceholderText('Autor'), 'Frank Herbert')
    await userEvent.type(screen.getByPlaceholderText('978…'), '9788498382671')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar libro' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ isbn: '9788498382671' })
  })
})
