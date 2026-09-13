interface SkeletonInlineProps {
  count?: number
}

/**
 * Skeletons pequeños para carga incremental: se colocan al final del
 * grid existente (no lo reemplazan) mientras llega la siguiente página.
 */
export default function SkeletonInline({ count = 3 }: SkeletonInlineProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      aria-busy="true"
      aria-label="Cargando más elementos"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4" aria-hidden="true">
          <div className="skeleton w-16 h-16 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
