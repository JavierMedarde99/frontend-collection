export type OwnerTab = 'mine' | 'other'

interface OwnerTabsProps {
  value: OwnerTab
  onChange: (tab: OwnerTab) => void
  /** Sin sesión solo existe "Todas". */
  showMine: boolean
}

/** Pestañas Mi colección / Todas para los listados, con filete del acento (--sc). */
export default function OwnerTabs({ value, onChange, showMine }: OwnerTabsProps) {
  if (!showMine) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1" role="tablist" aria-label="Colecciones">
          <span
            role="tab"
            aria-selected="true"
            className="owner-tab owner-tab--active text-body-sm font-medium"
          >
            Todas
          </span>
        </div>
        <div className="filet" aria-hidden="true" />
      </div>
    )
  }
  const tabs: { key: OwnerTab; label: string }[] = [
    { key: 'mine', label: 'Mi colección' },
    { key: 'other', label: 'Todas' },
  ]
  return (
    <div className="flex flex-col gap-0">
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
              className={`owner-tab text-body-sm font-medium transition-all duration-200 ${
                active ? 'owner-tab--active' : 'text-graphite hover:text-brand hover:bg-brand-soft'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="filet" aria-hidden="true" />
    </div>
  )
}