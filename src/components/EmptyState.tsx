import { ReactNode } from 'react'

type EmptyStateVariant = 'search' | 'empty' | 'info'

interface EmptyStateProps {
  title: string
  message?: string
  action?: ReactNode
  /**
   * Icono según el contexto: 'search' (sin resultados de búsqueda, por defecto),
   * 'empty' (colección aún sin elementos) e 'info' (estado informativo:
   * privado, no encontrado…).
   */
  variant?: EmptyStateVariant
  /** Icono propio (ReactNode) que sustituye al de la variante. */
  icon?: ReactNode
}

const ICONS: Record<EmptyStateVariant, ReactNode> = {
  // Lupa: "no hay resultados para tu búsqueda".
  search: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
      <path
        strokeLinecap="round"
        strokeWidth={1.8}
        d="M12 8.75v.01M12 12v.01M12 15.25v.01"
      />
    </>
  ),
  // Círculo con "+": "aún no hay nada, añade el primero".
  empty: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  // Candado: estado informativo (colección privada, usuario no encontrado…).
  info: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 12v6.75a2.25 2.25 0 002.25 2.25z"
    />
  ),
}

export default function EmptyState({
  title,
  message,
  action,
  variant = 'search',
  icon,
}: EmptyStateProps) {
  return (
    <div className="card animate-fade-in flex flex-col items-center text-center gap-5 py-16 px-8 bg-gradient-to-b from-white to-brand-soft/50 dark:from-[#241b12] dark:to-[#3a2413]/50">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-brand-glow empty-mark">
        {icon ?? (
          <svg
            aria-hidden="true"
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {ICONS[variant]}
          </svg>
        )}
      </div>
      <div>
        <h3 className="font-display text-heading text-ink mb-1.5">{title}</h3>
        {message && <p className="text-body text-slate max-w-md mx-auto">{message}</p>}
      </div>
      {action}
    </div>
  )
}
