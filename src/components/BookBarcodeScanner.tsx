import { useEffect, useId, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface BookBarcodeScannerProps {
  open: boolean
  onClose: () => void
  onBarcodeDetected: (isbn: string) => void
}

function normalizeIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, '').toUpperCase()
}

/** Modal que escanea EAN-13/ISBN con la cámara trasera y devuelve el ISBN detectado. */
export default function BookBarcodeScanner({ open, onClose, onBarcodeDetected }: BookBarcodeScannerProps) {
  const elementId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const doneRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    doneRef.current = false
    setError(null)
    const scanner = new Html5Qrcode(`barcode-${elementId}`)
    scannerRef.current = scanner
    let cancelled = false

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 300, height: 100 } },
        (decoded) => {
          if (doneRef.current) return
          doneRef.current = true
          const isbn = normalizeIsbn(decoded)
          scanner
            .stop()
            .catch(() => {})
            .finally(() => onBarcodeDetected(isbn))
        },
        () => {},
      )
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof Error && err.name === 'NotAllowedError') {
          setError('Permiso de cámara denegado. Puedes introducir el ISBN manualmente.')
        } else {
          setError('No se pudo iniciar la cámara. Puedes introducir el ISBN manualmente.')
        }
      })

    return () => {
      cancelled = true
      scanner
        .stop()
        .catch(() => {})
        .finally(() => scanner.clear().catch(() => {}))
      scannerRef.current = null
    }
  }, [open, elementId, onBarcodeDetected])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Escanear ISBN"
        className="modal w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-heading-sm">Escanear ISBN</h3>
          <button
            type="button"
            className="btn-ghost !px-3 !py-1.5"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <p className="text-body-sm text-slate mb-4">
          Alinea el código de barras del libro dentro del marco.
        </p>
        <div id={`barcode-${elementId}`} className="w-full overflow-hidden rounded-xl" />
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mt-4" role="alert">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
