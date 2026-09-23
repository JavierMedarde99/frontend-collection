import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ReadingProgressBar from '../components/ReadingProgressBar'
import { BookState } from '../types/BookState'

describe('ReadingProgressBar', () => {
  it('en TO_READ no renderiza nada', () => {
    const { container } = render(<ReadingProgressBar pages={100} pagesRead={50} state={BookState.TO_READ} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('en COMPLETED muestra Finalizado sin barra', () => {
    render(<ReadingProgressBar pages={100} pagesRead={100} state={BookState.COMPLETED} />)
    expect(screen.getByText('Finalizado')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('sin páginas muestra aviso', () => {
    render(<ReadingProgressBar pages={undefined} pagesRead={0} state={BookState.READING} />)
    expect(screen.getByText('Sin información de páginas')).toBeInTheDocument()
  })

  it('sin empezar muestra barra al 0% y No comenzado', () => {
    render(<ReadingProgressBar pages={100} pagesRead={0} state={BookState.READING} />)
    expect(screen.getByText('No comenzado')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('a la mitad muestra páginas restantes', () => {
    render(<ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} />)
    expect(screen.getByText('50 / 100 páginas — 50% completado (50 restantes)')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })

  it('terminado muestra barra verde y Completado', () => {
    render(<ReadingProgressBar pages={100} pagesRead={100} state={BookState.READING} />)
    expect(screen.getByText('Completado')).toBeInTheDocument()
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '100')
    expect(bar.className).toContain('bg-green-600')
  })

  it('valor mayor que el total clampa al 100% con aviso', () => {
    render(<ReadingProgressBar pages={100} pagesRead={150} state={BookState.READING} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByText(/valor desactualizado/)).toBeInTheDocument()
  })

  it('compact solo muestra barra pequeña y %', () => {
    render(<ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} compact />)
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.queryByText(/restantes/)).not.toBeInTheDocument()
  })

  it('clic en la barra abre el modal y guardar llama a onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} showInput onChange={onChange} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Actualizar páginas leídas' }))
    expect(screen.getByRole('dialog', { name: 'Actualizar páginas leídas' })).toBeInTheDocument()
    const input = screen.getByLabelText('Nº de páginas leídas')
    await user.clear(input)
    await user.type(input, '80')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onChange).toHaveBeenCalledWith(80)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cancelar cierra el modal sin llamar a onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} showInput onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Actualizar páginas leídas' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('el modal avisa y bloquea si el valor excede el total', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} showInput onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Actualizar páginas leídas' }))
    const input = screen.getByLabelText('Nº de páginas leídas')
    await user.clear(input)
    await user.type(input, '150')
    expect(screen.getByText('No puede exceder el total de páginas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('sin onChange la barra no es clicable', () => {
    render(<ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} showInput />)
    expect(screen.queryByRole('button', { name: 'Actualizar páginas leídas' })).not.toBeInTheDocument()
  })

  it('aplica className al contenedor', () => {
    const { container } = render(
      <ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} className="mi-clase" />,
    )
    expect(container.firstChild).toHaveClass('mi-clase')
  })
})
