import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useGenreOptions } from '../hooks/useGenreOptions'

function Probe({ fetcher }: { fetcher: () => Promise<string[]> }) {
  const options = useGenreOptions(['Fantasía'], fetcher)
  return (
    <select aria-label="Género">
      {options.map((g) => (
        <option key={g} value={g}>{g}</option>
      ))}
    </select>
  )
}

describe('useGenreOptions', () => {
  it('combina lista cerrada con catálogo del backend sin duplicar', async () => {
    render(<Probe fetcher={() => Promise.resolve(['Fiction / Fantasy / Epic', 'Fantasía'])} />)
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Fiction / Fantasy / Epic' })).toBeInTheDocument(),
    )
    expect(screen.getAllByRole('option', { name: 'Fantasía' })).toHaveLength(1)
  })

  it('si falla la carga deja solo la lista cerrada', async () => {
    const spy = vi.fn().mockRejectedValue(new Error('caído'))
    render(<Probe fetcher={spy} />)
    await waitFor(() => expect(spy).toHaveBeenCalled())
    expect(screen.getByRole('option', { name: 'Fantasía' })).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(1)
  })
})
