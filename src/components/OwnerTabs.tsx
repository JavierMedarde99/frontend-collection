import { useRef, type KeyboardEvent } from 'react'

export type OwnerTab = 'mine' | 'other'

interface OwnerTabsProps {
  value: OwnerTab
  onChange: (tab: OwnerTab) => void
  /** Sin sesión solo existe "Todas". */
  showMine: boolean
}

/** Pestañas Mi colección / Todas para los listados, con filete del acento (--sc).
 * Accesibles por teclado: flechas izq/der, Home/End y roving tabindex. */
export default function OwnerTabs({ value, onChange, showMine }: OwnerTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

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
  const activeIndex = tabs.findIndex((tab) => tab.key === value)

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = tabs.length
    let next = -1
    if (e.key === 'ArrowRight') next = (index + 1) % count
    else if (e.key === 'ArrowLeft') next = (index - 1 + count) % count
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = count - 1
    if (next < 0) return
    e.preventDefault()
    onChange(tabs[next].key)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-1" role="tablist" aria-label="Colecciones">
        {tabs.map((tab, index) => {
          const active = value === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              ref={(el) => { tabRefs.current[index] = el }}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
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
