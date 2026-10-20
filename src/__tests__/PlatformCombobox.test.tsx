import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
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
