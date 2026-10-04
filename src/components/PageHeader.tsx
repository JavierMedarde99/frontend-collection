import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  /** Cerrar la cabecera con la regla doble (default true). */
  rule?: boolean
}

/**
 * Cabecera de catálogo Gabinete: kicker ✦ + título Fraunces + subtítulo
 * opcional + acciones, cerrada por la regla doble con barra de acento.
 * El acento (--sc/--c) lo fija la página que lo renderiza.
 */
export default function PageHeader({ eyebrow, title, subtitle, actions, rule = true }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-9">
      <div className="page-head">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="ph-title">{title}</h1>
        {subtitle != null && <p className="ph-sub">{subtitle}</p>}
        {actions != null && <div className="flex flex-wrap items-center gap-2 mt-3">{actions}</div>}
      </div>
      {rule && (
        <div className="rule-double">
          <span className="accent-bar" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}