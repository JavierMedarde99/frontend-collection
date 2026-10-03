import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import BoardGameCard from '../components/BoardGameCard'
import GameCard from '../components/GameCard'
import MovieShowCard from '../components/MovieShowCard'
import BookCard from '../components/BookCard'
import { BoardGameStatus, BookState, BookType, GameStatus, MediaType, MovieShowStatus } from '../types'
import type { BoardGame, Book, Game, MovieShow } from '../types'

/**
 * Los diálogos de estado se renderizan dentro de una tarjeta con
 * `animate-fade-up` (`fill-mode: both` deja `transform: translateY(0)` para
 * siempre). Un transform no-`none` crea un containing block para `position:
 * fixed`, así que el overlay `fixed inset-0` del diálogo deja de cubrir el
 * viewport y otra tarjeta de la lista puede superponérsele. El fix pasa por
 * renderizar el diálogo en un portal (fuera de la tarjeta). jsdom no mide
 * layout: el test es estructural, comprueba que el diálogo ya no es
 * descendiente del `<article>` de la tarjeta.
 */
describe('Diálogos de estado fuera de la tarjeta (portal)', () => {
  it('mesa: el diálogo «En propiedad» no es descendiente de la tarjeta', async () => {
    const boardGame: BoardGame = {
      id: 'bg1',
      title: 'Catan',
      status: BoardGameStatus.WISHLIST,
    }
    render(
      <MemoryRouter>
        <BoardGameCard game={boardGame} onDelete={vi.fn()} />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Marcar Catan como en propiedad' }))

    const dialog = screen.getByRole('dialog', { name: 'Marcar como en propiedad' })
    expect(dialog).toBeInTheDocument()
    expect(dialog.closest('article')).toBeNull()
  })

  it('juegos: el diálogo «En posesión» no es descendiente de la tarjeta', async () => {
    const game: Game = {
      id: 'g1',
      title: 'Hollow Knight',
      platform: 'PC (Windows)',
      status: GameStatus.WISHLIST,
    }
    render(
      <MemoryRouter>
        <GameCard game={game} onDelete={vi.fn()} />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Marcar Hollow Knight como en posesión' }))

    const dialog = screen.getByRole('dialog', { name: 'Marcar como en posesión' })
    expect(dialog).toBeInTheDocument()
    expect(dialog.closest('article')).toBeNull()
  })

  it('películas: el diálogo «Empezar a ver» no es descendiente de la tarjeta', async () => {
    const movieShow: MovieShow = {
      id: 'm1',
      title: 'Dune',
      mediaType: MediaType.MOVIE,
      status: MovieShowStatus.PLAN_TO_WATCH,
    }
    render(
      <MemoryRouter>
        <MovieShowCard movieShow={movieShow} onDelete={vi.fn()} />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Empezar a ver Dune' }))

    const dialog = screen.getByRole('dialog', { name: 'Empezar a ver' })
    expect(dialog).toBeInTheDocument()
    expect(dialog.closest('article')).toBeNull()
  })

  it('libros: el diálogo «En posesión» no es descendiente de la tarjeta', async () => {
    const book: Book = {
      id: 'b1',
      title: 'Dune',
      author: 'Frank Herbert',
      type: BookType.NOVEL,
      state: BookState.WISHLIST,
    }
    render(
      <MemoryRouter>
        <BookCard book={book} onDelete={vi.fn()} />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Marcar Dune como en posesión' }))

    const dialog = screen.getByRole('dialog', { name: 'Marcar como en posesión' })
    expect(dialog).toBeInTheDocument()
    expect(dialog.closest('article')).toBeNull()
  })
})