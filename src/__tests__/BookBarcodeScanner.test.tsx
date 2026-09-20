import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BookBarcodeScanner from '../components/BookBarcodeScanner'

const store = vi.hoisted(() => ({ instances: [] as MockScanner[], failNext: null as unknown | null }))

interface MockScanner {
  onSuccess: ((decoded: string) => void) | null
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

vi.mock('html5-qrcode', () => {
  class InnerMock {
    onSuccess: ((decoded: string) => void) | null = null
    start = vi.fn((_config: unknown, _opts: unknown, ok: (d: string) => void, _fail: (e: unknown) => void) => {
      this.onSuccess = ok
      if (store.failNext) return Promise.reject(store.failNext)
      return Promise.resolve()
    })
    stop = vi.fn(() => Promise.resolve())
    clear = vi.fn(() => Promise.resolve())
    constructor() {
      store.instances.push(this as unknown as MockScanner)
    }
  }
  return { Html5Qrcode: InnerMock }
})

beforeEach(() => {
  store.instances.length = 0
  store.failNext = null
  vi.clearAllMocks()
})

function renderScanner(props: { open?: boolean } = {}) {
  const onClose = vi.fn()
  const onBarcodeDetected = vi.fn()
  const view = render(
    <BookBarcodeScanner open={props.open ?? true} onClose={onClose} onBarcodeDetected={onBarcodeDetected} />,
  )
  return { onClose, onBarcodeDetected, ...view }
}

describe('BookBarcodeScanner', () => {
  it('inicia la cámara trasera al abrir', async () => {
    renderScanner()
    await waitFor(() => expect(store.instances).toHaveLength(1))
    const scanner = store.instances[0]!
    expect(scanner.start).toHaveBeenCalledWith(
      { facingMode: 'environment' },
      expect.objectContaining({ qrbox: { width: 300, height: 100 } }),
      expect.any(Function),
      expect.any(Function),
    )
  })

  it('notifica el ISBN normalizado y detiene el scanner', async () => {
    const { onBarcodeDetected } = renderScanner()
    await waitFor(() => expect(store.instances).toHaveLength(1))
    const scanner = store.instances[0]!

    scanner.onSuccess!('978-84-983-8267-1')

    await waitFor(() => expect(onBarcodeDetected).toHaveBeenCalledWith('9788498382671'))
    expect(scanner.stop).toHaveBeenCalled()
  })

  it('muestra mensaje amable si deniegan la cámara', async () => {
    const err = new Error('denied')
    err.name = 'NotAllowedError'
    store.failNext = err
    renderScanner()
    expect(await screen.findByRole('alert')).toHaveTextContent('Permiso de cámara denegado')
  })

  it('cerrar llama a onClose', async () => {
    const { onClose } = renderScanner()
    await waitFor(() => expect(store.instances).toHaveLength(1))
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('al desmontar detiene el scanner', async () => {
    const { unmount } = renderScanner()
    await waitFor(() => expect(store.instances).toHaveLength(1))
    const scanner = store.instances[0]!
    unmount()
    expect(scanner.stop).toHaveBeenCalled()
  })

  it('con open=false no renderiza nada', () => {
    renderScanner({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(store.instances).toHaveLength(0)
  })
})
