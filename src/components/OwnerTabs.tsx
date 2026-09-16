export type OwnerTab = 'mine' | 'other'

interface OwnerTabsProps {
  value: OwnerTab
  onChange: (tab: OwnerTab) => void
  /** Sin sesión solo existe "Otras colecciones". */
  showMine: boolean
}

/** Pestañas Mi colección / Otras colecciones para los listados. */
export default function OwnerTabs({ value, onChange, showMine }: OwnerTabsProps) {
  if (!showMine) {
    return (
      <div className="flex items-center gap-1" role="tablist" aria-label="Colecciones">
        <span
          role="tab"
          aria-selected="true"
          className="text-body-sm px-3.5 py-1.5 rounded-full font-medium bg-brand text-white shadow-brand-glow"
        >
          Otras colecciones
        </span>
      </div>
    )
  }
  const tabs: { key: OwnerTab; label: string }[] = [
    { key: 'mine', label: 'Mi colección' },
    { key: 'other', label: 'Otras colecciones' },
  ]
  return (
    <div className="flex items-center gap-1" role="tablist" aria-label="Colecciones">
      {tabs.map((tab) => {
        const active = value === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`text-body-sm px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ${
              active
                ? 'bg-brand text-white shadow-brand-glow'
                : 'text-graphite hover:text-brand hover:bg-brand-soft'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
