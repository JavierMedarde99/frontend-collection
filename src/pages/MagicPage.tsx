import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import PageHeader from '../components/PageHeader'
import { COLLECTIONS_BY_KEY, type CollectionKey } from '../constants/collections'
import { usePageTitle } from '../hooks/usePageTitle'

interface MagicEntry {
  key: CollectionKey
  title: string
  description: string
}

const ENTRIES: MagicEntry[] = [
  {
    key: 'magic',
    title: 'Cartas',
    description: 'Tu colección de cartas Magic: búscalas en Scryfall o añade tus piezas a mano.',
  },
  {
    key: 'decks',
    title: 'Mazos',
    description: 'Mazos armados, con sus colores, comandante y las cartas que los forman.',
  },
]

export default function MagicPage() {
  usePageTitle('Magic')

  return (
    <section className="flex flex-col gap-12 animate-fade-up">
      <PageHeader
        eyebrow="Magic"
        title="Magic"
        subtitle="Cartas y mazos: dos vitrinas para tu colección de Magic."
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
