import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useListQuery } from '../hooks/useListQuery'

const seen: unknown[][] = []

function Probe() {
  const [query, setQuery] = useListQuery({ genre: [] as string[], name: '' })
  seen.push(query.genre)
  return (
    <>
      <span>{query.genre.join(',')}</span>
      <button type="button" onClick={() => setQuery({ genre: ['A', 'B'] })}>
        set
      </button>
    </>
  )
}

function renderProbe(initialEntries: string[] = ['/x']) {
  seen.length = 0
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Probe />
    </MemoryRouter>,
  )
}

describe('useListQuery con arrays', () => {
  it('devuelve la misma referencia entre renders si no cambia', () => {
    const { rerender } = renderProbe()
    rerender(
      <MemoryRouter initialEntries={['/x']}>
        <Probe />
      </MemoryRouter>,
    )
    expect(seen.length).toBeGreaterThanOrEqual(2)
    expect(seen[0]).toBe(seen[1])
  })

  it('lee varios valores de la URL de forma estable', () => {
    const { rerender } = renderProbe(['/x?genre=A&genre=B'])
    expect(screen.getByText('A,B')).toBeInTheDocument()
    rerender(
      <MemoryRouter initialEntries={['/x?genre=A&genre=B']}>
        <Probe />
      </MemoryRouter>,
    )
    const last = seen[seen.length - 1]
    expect(seen.every((arr) => arr === last)).toBe(true)
  })

  it('setQuery escribe valores repetidos en la URL', async () => {
    const user = userEvent.setup()
    renderProbe()
    await user.click(screen.getByRole('button', { name: 'set' }))
    expect(screen.getByText('A,B')).toBeInTheDocument()
  })
})
