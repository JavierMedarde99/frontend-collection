import { useEffect } from 'react'

const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: '/', description: 'Enfocar el buscador de la lista' },
  { keys: 'Esc', description: 'Soltar el buscador o cerrar diálogos' },
  { keys: '?', description: 'Abrir esta ayuda' },
]

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet">
      <div role="dialog" aria-modal="true" aria-label="Ayuda de atajos de teclado" className="modal w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-heading-sm">Atajos de teclado</h3>
          <button
            type="button"
            className="btn-ghost !p-2"
            onClick={onClose}
            aria-label="Cerrar ayuda"
          >
            ✕
          </button>
        </div>
        <ul className="flex flex-col gap-3">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.keys} className="flex items-center justify-between gap-4">
              <span className="text-body text-slate">{shortcut.description}</span>
              <kbd className="shrink-0 px-2 py-1 rounded-lg bg-paper border border-silver text-caption font-semibold text-ink">
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <div className="border-t border-silver/60 mt-6 pt-5">
          <h4 className="font-display text-heading-sm mb-2">Consejos rápidos</h4>
          <ul className="text-body text-slate list-disc pl-5 flex flex-col gap-1.5">
            <li>Pulsa una carta para ver su detalle y editarla.</li>
            <li>Usa los filtros para acotar cada colección.</li>
            <li>El botón + de cada sección añade elementos a esa colección.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
