import { useEffect, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'

interface CardMenuProps {
  detailTo: string
  editTo: string
  itemName: string
  onDelete: () => Promise<void>
}

/**
 * Menú contextual (tres puntos) con Ver detalle, Editar y Eliminar.
 * Accesible por teclado: Enter/Espacio abre, Escape cierra.
 */
export default function CardMenu({ detailTo, editTo, itemName, onDelete }: CardMenuProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open ])

  function go(to: string) {
    return (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
      navigate(to)
    }
  }

  async function confirmDelete() {
    setBusy(true)
    setError(null)
    try {
      await onDelete()
      setConfirming(false)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative" onClick={(e) => e.preventDefault()}>
      <button
        type="button"
        className="btn-ghost !p-2 !rounded-full md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:focus-visible:opacity-100"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acciones para ${itemName}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
          setError(null)
        }}
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 4.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            aria-label={`Acciones para ${itemName}`}
            className="absolute right-0 top-full mt-1 z-50 w-44 card !p-1.5 flex flex-col animate-fade-in"
          >
            <button type="button" role="menuitem" className="text-left text-body-sm px-3 py-2 rounded-lg hover:bg-brand-soft hover:text-brand" onClick={go(detailTo)}>
              Ver detalle
            </button>
            <button type="button" role="menuitem" className="text-left text-body-sm px-3 py-2 rounded-lg hover:bg-brand-soft hover:text-brand" onClick={go(editTo)}>
              Editar
            </button>
            <button
              type="button"
              role="menuitem"
              className="text-left text-body-sm px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setConfirming(true)
              }}
            >
              Eliminar
            </button>
            {error && (
              <p className="px-3 py-1.5 text-caption text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirming}
        title={`Eliminar "${itemName}"`}
        message="Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
        busy={busy}
      />
    </div>
  )
}
