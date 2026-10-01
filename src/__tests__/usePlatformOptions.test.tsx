import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePlatformOptions } from '../hooks/usePlatformOptions'
import type { PlatformInfo } from '../types'

function Probe({ fetcher }: { fetcher: () => Promise<PlatformInfo[]> }) {
  const options = usePlatformOptions(fetcher)
  return (
    <select aria-label="Plataforma">
      {options.map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  )
}

describe('usePlatformOptions', () => {
  it('muestra el catálogo del backend sin duplicados ni nombres vacíos', async () => {
    render(
      <Probe
        fetcher={() =>
          Promise.resolve([
            { id: 1, name: 'PlayStation 5', slug: 'ps5' },
            { id: 1, name: 'PlayStation 5', slug: 'ps5' },
            { id: 2, name: '  ', slug: 'blank' },
            { id: 3, name: 'Nintendo Switch', slug: 'nintendo-switch' },
          ] as PlatformInfo[])
        }
      />,
    )

    await waitFor(() =>
      expect(screen.getByRole('option', { name: 'PlayStation 5' })).toBeInTheDocument(),
    )
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('si falla la carga deja el desplegable vacío', async () => {
    const spy = vi.fn().mockRejectedValue(new Error('caído'))
    render(<Probe fetcher={spy} />)

    await waitFor(() => expect(spy).toHaveBeenCalled())
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })
})