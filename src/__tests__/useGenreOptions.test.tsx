import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useGenreOptions } from '../hooks/useGenreOptions'

function Probe({ fetcher }: { fetcher: () => Promise<string[]> }) {
  const options = useGenreOptions(fetcher)
  return (
    <select aria-label="Género">
      {options.map((g) => (
        <option key={g} value={g}>{g}</option>
      ))}
    </select>
  )
}

describe('useGenreOptions', () => {
  it('muestra solo el catálogo del backend, sin duplicados', async () => {
    render(<Probe fetcher={() => Promise.resolve(['Fiction / Fantasy / Epic', 'Fiction / Fantasy / Epic', ' Terror '] as unknown as string[])} />)
    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'Fiction / Fantasy / Epic' })).toBeInTheDocument(),
    )
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('si falla la carga deja el select vacío', async () => {
    const spy = vi.fn().mockRejectedValue(new Error('caído'))
    render(<Probe fetcher={spy} />)
    await waitFor(() => expect(spy).toHaveBeenCalled())
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })
})
