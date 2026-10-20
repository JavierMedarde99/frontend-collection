import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PlatformCombobox from '../components/PlatformCombobox'

const CATALOGO = ['PC', 'PlayStation 5', 'Nintendo Switch']

function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return <PlatformCombobox value={value} onChange={setValue} options={CATALOGO} />
}

function optionTexts() {
  return screen.getAllByRole('option').map((o) => o.textContent)
}

describe('PlatformCombobox', () => {
  it('muestra el catálogo completo al enfocar el campo', async () => {
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: 'Plataforma' })
    await userEvent.click(input)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(optionTexts()).toEqual(['PC', 'PlayStation 5', 'Nintendo Switch'])
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('filtra las opciones mientras se escribe', async () => {
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: 'Plataforma' })
    await userEvent.click(input)
    await userEvent.type(input, 'nin')

    expect(optionTexts()).toEqual(['Nintendo Switch'])
  })

  it('mantiene en la lista la plataforma actual aunque el filtro no la coincida', async () => {
    render(<Harness initial="WII_U" />)
    const input = screen.getByRole('combobox', { name: 'Plataforma' })
    await userEvent.click(input)
    await userEvent.type(input, 'play')

    expect(optionTexts()).toContain('Wii U')
    expect(optionTexts()).toContain('PlayStation 5')
  })

  it('elige la opción resaltada con Enter', async () => {
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: 'Plataforma' })
    await userEvent.click(input)
    await userEvent.type(input, 'nin')
    await userEvent.keyboard('{Enter}')

    expect(input).toHaveValue('Nintendo Switch')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('elige una opción haciendo clic y guarda su valor crudo', async () => {
    render(<Harness initial="WII_U" />)
    const input = screen.getByRole('combobox', { name: 'Plataforma' })
    await userEvent.click(input)
    await userEvent.click(screen.getByRole('option', { name: 'PC' }))

    expect(input).toHaveValue('PC')
  })

  it('permite texto libre que no coincide con ninguna opción', async () => {
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: 'Plataforma' })
    await userEvent.click(input)
    await userEvent.type(input, 'Steam Deck')
    await userEvent.keyboard('{Enter}')

    expect(input).toHaveValue('Steam Deck')
  })

  it('cierra la lista con Escape y lo refleja en aria', async () => {
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: 'Plataforma' })
    await userEvent.click(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })
})

/** Modo múltiple (filtro del listado): checkboxes que no cierran al marcar. */
function MultiHarness({ initial = [] as string[], onChange = vi.fn() }: { initial?: string[]; onChange?: (next: string[]) => void }) {
  const [value, setValue] = useState(initial)
  return (
    <PlatformCombobox
      multiple
      values={value}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
      options={CATALOGO}
      allowCustom={false}
      emptyOptionLabel="Todas las plataformas"
      placeholder="Filtrar plataforma…"
      ariaLabel="Filtrar por plataforma"
    />
  )
}

describe('PlatformCombobox en modo múltiple', () => {
  it('muestra la opción de «todas» y el catálogo, y no permite texto libre', async () => {
    const onChange = vi.fn()
    render(<MultiHarness onChange={onChange} />)
    const input = screen.getByRole('combobox', { name: 'Filtrar por plataforma' })

    await userEvent.click(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(optionTexts()).toEqual(['Todas las plataformas', 'PC', 'PlayStation 5', 'Nintendo Switch'])

    await userEvent.type(input, 'zzz')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('marca varias plataformas sin cerrar el desplegable y las resume en el input', async () => {
    const onChange = vi.fn()
    render(<MultiHarness onChange={onChange} />)
    const input = screen.getByRole('combobox', { name: 'Filtrar por plataforma' })
    await userEvent.click(input)

    await userEvent.click(screen.getByRole('checkbox', { name: 'PC' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Nintendo Switch' }))

    expect(onChange).toHaveBeenNthCalledWith(1, ['PC'])
    expect(onChange).toHaveBeenNthCalledWith(2, ['PC', 'Nintendo Switch'])
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(input).toHaveValue('PC, Nintendo Switch')
  })

  it('desmarca una plataforma ya elegida y «Todas» limpia la selección', async () => {
    const onChange = vi.fn()
    render(<MultiHarness initial={['PC', 'PlayStation 5']} onChange={onChange} />)
    const input = screen.getByRole('combobox', { name: 'Filtrar por plataforma' })
    await userEvent.click(input)

    await userEvent.click(screen.getByRole('checkbox', { name: 'PC' }))
    expect(onChange).toHaveBeenLastCalledWith(['PlayStation 5'])

    await userEvent.click(screen.getByRole('checkbox', { name: 'Todas las plataformas' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('mantiene en la lista una plataforma activa que el catálogo ya no ofrece', async () => {
    render(<MultiHarness initial={['WII_U']} />)
    const input = screen.getByRole('combobox', { name: 'Filtrar por plataforma' })

    expect(input).toHaveValue('Wii U')
    await userEvent.click(input)
    expect(optionTexts()).toContain('Wii U')
    expect(screen.getByRole('checkbox', { name: 'Wii U' })).toBeChecked()
  })
})
