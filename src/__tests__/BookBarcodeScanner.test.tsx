import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BookBarcodeScanner from '../components/BookBarcodeScanner'

const store = vi.hoisted(() => ({ instances: [] as MockScanner[], failNext: null as unknown | null }))

interface MockScanner {
  onSuccess: ((decoded: string) => void) | null
  running: boolean
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
  getState: ReturnType<typeof vi.fn>
}

vi.mock('html5-qrcode', () => {
  const NOT_STARTED = 0
  const SCANNING = 1
  class InnerMock {
    onSuccess: ((decoded: string) => void) | null = null
    running = true
    start = vi.fn((_config: unknown, _opts: unknown, ok: (d: string) => void, _fail: (e: unknown) => void) => {
      this.onSuccess = ok
      if (store.failNext) {
        this.running = false
        return Promise.reject(store.failNext)
      }
      return Promise.resolve()
    })
    stop = vi.fn(() => {
      if (!this.running) return Promise.reject(new Error('Cannot stop, scanner is not running or paused.'))
      this.running = false
      return Promise.resolve()
    })
    clear = vi.fn(() => undefined)
    getState = vi.fn(() => (this.running ? SCANNING : NOT_STARTED))
    constructor() {
      store.instances.push(this as unknown as MockScanner)
    }
  }
  return {
    Html5Qrcode: InnerMock,
    Html5QrcodeScannerState: { NOT_STARTED, SCANNING, PAUSED: 2 },
  }
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

  it('no llama a stop si el scanner no está corriendo', async () => {
    const { unmount } = renderScanner()
    await waitFor(() => expect(store.instances).toHaveLength(1))
    const scanner = store.instances[0]!
    scanner.running = false
    scanner.stop.mockClear()
    unmount()
    await waitFor(() => expect(scanner.clear).toHaveBeenCalled())
    expect(scanner.stop).not.toHaveBeenCalled()
  })

  it('con open=false no renderiza nada', () => {
    renderScanner({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(store.instances).toHaveLength(0)
  })
})
