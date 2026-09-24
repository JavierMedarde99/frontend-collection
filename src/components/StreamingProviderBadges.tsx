import type { StreamingProvider } from '../types'

interface StreamingProviderBadgesProps {
  providers?: StreamingProvider[] | null
  className?: string
  compact?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  flatrate: 'Suscripción',
  buy: 'Compra',
  rent: 'Alquiler',
}

function ProviderLogo({ provider, size }: { provider: StreamingProvider; size: string }) {
  const label = provider.providerName || 'Plataforma'
  if (!provider.logoUrl) {
    return (
      <span className="text-caption text-graphite border border-silver/60 rounded-md px-2 py-1" title={label}>
        {label}
      </span>
    )
  }
  return (
    <img
      src={provider.logoUrl}
      alt={label}
      title={label}
      loading="lazy"
      className={`${size} w-auto rounded-md shadow-sm object-contain bg-paper`}
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

/** Logos de plataformas de streaming, agrupados por tipo de acceso. */
export default function StreamingProviderBadges({ providers, className = '', compact = false }: StreamingProviderBadgesProps) {
  if (!providers || providers.length === 0) return null

  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {providers.map((p, i) => (
          <ProviderLogo key={p.providerId ?? i} provider={p} size="h-6" />
        ))}
      </div>
    )
  }

  const groups = new Map<string, StreamingProvider[]>()
  for (const p of providers) {
    // El backend serializa el enum en mayúsculas (FLATRATE); normalizar por si acaso.
    const key = (p.type || 'other').toLowerCase()
    const list = groups.get(key)
    if (list) list.push(p)
    else groups.set(key, [p])
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {[...groups.entries()].map(([type, list]) => (
        <div key={type}>
          <p className="text-caption text-stone uppercase tracking-wide mb-1.5">{TYPE_LABELS[type] || 'Otras'}</p>
          <div className="flex flex-wrap items-center gap-2">
            {list.map((p, i) => (
              <ProviderLogo key={p.providerId ?? i} provider={p} size="h-8" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
