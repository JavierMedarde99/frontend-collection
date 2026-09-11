interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  disabled?: boolean
}

export default function Pagination({ page, totalPages, onChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) return null
  const first = page === 0
  const last = page >= totalPages - 1

  return (
    <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Paginación">
      <button
        type="button"
        className="btn-ghost !px-3 !py-2"
        disabled={first || disabled}
        onClick={() => onChange(0)}
        aria-label="Primera página"
        title="Primera página"
      >
        «
      </button>
      <button
        type="button"
        className="btn-ghost !px-4 !py-2"
        disabled={first || disabled}
        onClick={() => onChange(Math.max(0, page - 1))}
      >
        Anterior
      </button>
      <span className="text-body-sm text-graphite tabular-nums px-2" aria-current="page">
        Página {page + 1} de {totalPages}
      </span>
      <button
        type="button"
        className="btn-ghost !px-4 !py-2"
        disabled={last || disabled}
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
      >
        Siguiente
      </button>
      <button
        type="button"
        className="btn-ghost !px-3 !py-2"
        disabled={last || disabled}
        onClick={() => onChange(totalPages - 1)}
        aria-label="Última página"
        title="Última página"
      >
        »
      </button>
    </nav>
  )
}
