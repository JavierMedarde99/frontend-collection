import type { ReactNode } from 'react'

export interface MetaItem {
  label: string
  value: ReactNode
}

interface MetaListProps {
  items: MetaItem[]
  /** 2 columnas (lg) para fichas anchas, 3 para el resto. Por defecto: 2. */
  columns?: 2 | 3
}

/**
 * Lista de metadatos de detalle: etiqueta versalita + valor Fraunces.
 * Stack en móvil, 2 columnas ≥ md, 3 columnas ≥ lg con la variante cols-3.
 */
export default function MetaList({ items, columns = 2 }: MetaListProps) {
  const cols = columns === 3 ? 'cols-3' : 'cols-2'
  return (
    <dl className={`meta-list ${cols}`}>
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className="meta-item">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}