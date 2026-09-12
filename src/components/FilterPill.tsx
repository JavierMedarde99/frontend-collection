import type { ReactNode } from 'react'

interface FilterPillProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  label: string
}

/**
 * Píldora de filtro con estado activo/inactivo centralizado.
 * Sustituye los ternarios inline repetidos en las páginas de listado.
 */
export default function FilterPill({ active, onClick, children, label }: FilterPillProps) {
  return (
    <button
      type="button"
      className={`btn-ghost !px-4 !py-2 ${active ? '!bg-brand-deep !text-white !border-brand-deep !shadow-brand-glow' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
    >
      {children}
    </button>
  )
}
