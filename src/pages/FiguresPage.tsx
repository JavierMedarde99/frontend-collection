import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import PageHeader from '../components/PageHeader'
import { COLLECTIONS_BY_KEY, type CollectionKey } from '../constants/collections'
import { usePageTitle } from '../hooks/usePageTitle'

interface FigureEntry {
  key: CollectionKey
  title: string
  description: string
}

const ENTRIES: FigureEntry[] = [
  {
    key: 'funkos',
    title: 'Funko Pop',
    description: 'Figuras Pop! de vinilo: búscalas en el catálogo o añade tus piezas a mano.',
  },
  {
    key: 'amiibos',
    title: 'Amiibo',
    description: 'Figuras Amiibo de Nintendo, con sus series y juegos compatibles.',
  },
]

export default function FiguresPage() {
  usePageTitle('Figuras')

  return (
    <section className="flex flex-col gap-12 animate-fade-up">
      <PageHeader
        eyebrow="Figuras"
        title="Figuras"
        subtitle="Funko Pop y Amiibo: dos vitrinas para tus figuras de colección."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ENTRIES.map((entry) => {
          const collection = COLLECTIONS_BY_KEY[entry.key]
          const accent = collection.accent.spine
          return (
            <Link
              key={entry.key}
              to={collection.to}
              className="card card-hover flex flex-col gap-3"
              style={{ borderTop: `3px solid ${accent}`, '--sc': accent, '--c': collection.accent.niche } as CSSProperties}
            >
              <span className="eyebrow" style={{ color: accent }}>
                {collection.nick}
              </span>
              <h2 className="font-display text-heading text-ink">{entry.title}</h2>
              <p className="text-body text-graphite">{entry.description}</p>
              <span className="btn-ghost !px-4 !py-2 self-start mt-2">Explorar</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
