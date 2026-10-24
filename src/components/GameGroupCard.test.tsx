import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GameGroupCard from './GameGroupCard'
import { GameStatus } from '../types'

describe('GameGroupCard', () => {
  const group = {
    gameKey: 'hk',
    title: 'Hollow Knight',
    thumbnailUrl: '/img.jpg',
    games: [
      { id: 'g1', title: 'Hollow Knight', platform: 'PC (Windows)', status: GameStatus.COMPLETED, thumbnailUrl: '/img.jpg', userRating: 9 },
      { id: 'g2', title: 'Hollow Knight', platform: 'Nintendo Switch', status: GameStatus.WISHLIST, thumbnailUrl: undefined, userRating: undefined },
    ],
  }

  it('muestra una fila por plataforma con su estado', () => {
    render(
      <MemoryRouter>
        <GameGroupCard group={group} />
      </MemoryRouter>
    )
    expect(screen.getByText('PC (Windows)')).toBeInTheDocument()
    expect(screen.getByText('Nintendo Switch')).toBeInTheDocument()
    expect(screen.getByText('Completado')).toBeInTheDocument()
    expect(screen.getByText('Lista de deseos')).toBeInTheDocument()
  })

  it('el título enlaza al primer registro', () => {
    render(
      <MemoryRouter>
        <GameGroupCard group={group} />
      </MemoryRouter>
    )
    const links = screen.getAllByRole('link', { name: /Hollow Knight/ })
    expect(links[0]).toHaveAttribute('href', '/juegos/g1')
  })
})
