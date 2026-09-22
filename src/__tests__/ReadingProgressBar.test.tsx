import { fireEvent, render, screen } from '@testing-library/react'
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

  it('showInput llama a onChange al editar', () => {
    const onChange = vi.fn()
    render(<ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} showInput onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Páginas leídas'), { target: { value: '80' } })
    expect(onChange).toHaveBeenCalledWith(80)
    expect(screen.queryByText('No puede exceder el total de páginas')).not.toBeInTheDocument()
  })

  it('showInput avisa si el valor excede el total', () => {
    render(<ReadingProgressBar pages={100} pagesRead={150} state={BookState.READING} showInput onChange={() => {}} />)
    expect(screen.getByText('No puede exceder el total de páginas')).toBeInTheDocument()
  })

  it('aplica className al contenedor', () => {
    const { container } = render(
      <ReadingProgressBar pages={100} pagesRead={50} state={BookState.READING} className="mi-clase" />,
    )
    expect(container.firstChild).toHaveClass('mi-clase')
  })
})
