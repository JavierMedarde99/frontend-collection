import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import BookCard from '../components/BookCard'
import { BookState } from '../types/BookState'
import { BookType } from '../types/BookType'
import type { Book } from '../types/Book'

const book: Book = {
  id: '1',
  title: 'Dune',
  author: 'Frank Herbert',
  descripcion: 'Novela de ciencia ficción.',
  pages: 412,
  type: BookType.NOVEL,
  state: BookState.COMPLETED,
  comment: 'Imprescindible.',
  start: 4,
}

function renderCard(data: Book = book) {
  return render(
    <MemoryRouter>
      <BookCard book={data} />
    </MemoryRouter>,
  )
}

describe('BookCard', () => {
  it('muestra el título y el autor', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByText('Frank Herbert')).toBeInTheDocument()
  })

  it('muestra las etiquetas de tipo y estado', () => {
    renderCard()
    expect(screen.getByText('Novela')).toBeInTheDocument()
    expect(screen.getByText('Completado')).toBeInTheDocument()
  })

  it('muestra el comentario cuando existe', () => {
    renderCard()
    expect(screen.getByText('Imprescindible.')).toBeInTheDocument()
  })

  it('muestra la valoración con acceso por aria-label', () => {
    renderCard()
    expect(screen.getByRole('img', { name: 'Valoración 4 de 5' })).toBeInTheDocument()
  })

  it('enlaza a la página de edición', () => {
    renderCard()
    expect(screen.getByRole('link', { name: 'Editar Dune' })).toHaveAttribute(
      'href',
      '/editar/1',
    )
  })

  it('indica que no hay portada cuando frontpage está vacía', () => {
    renderCard({ ...book, frontpage: undefined })
    expect(screen.getByText('Sin portada')).toBeInTheDocument()
  })

  it('muestra mini barra de progreso en READING', () => {
    renderCard({ ...book, state: BookState.READING, pagesRead: 206 })
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('no muestra progreso fuera de READING', () => {
    renderCard({ ...book, state: BookState.TO_READ, pagesRead: undefined })
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})