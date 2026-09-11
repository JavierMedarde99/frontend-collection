import { useState, type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ActionLinkProps {
  to: string
  className?: string
  children: ReactNode
  label: string
}

/**
 * Enlace de acción con feedback inmediato: al pulsarlo muestra un
 * spinner y bloquea re-pulsaciones hasta que la navegación desmonta
 * el componente. Para acciones de card (Editar, Ver detalle…).
 */
export default function ActionLink({ to, className, children, label }: ActionLinkProps) {
  const [pending, setPending] = useState(false)

  function handleClick(e: MouseEvent) {
    if (pending) {
      e.preventDefault()
      return
    }
    setPending(true)
  }

  return (
    <Link
      to={to}
      className={className}
      onClick={handleClick}
      aria-label={label}
      aria-disabled={pending}
    >
      {pending ? (
        <span className="inline-flex items-center gap-1.5" aria-live="polite">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
          <span className="sr-only">Cargando…</span>
          {children}
        </span>
      ) : (
        children
      )}
    </Link>
  )
}
