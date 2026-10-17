import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import Breadcrumbs, { type Crumb } from './Breadcrumbs'
import PageHeader from './PageHeader'

interface MethodTab {
  value: string
  label: string
}

interface CreateShellProps {
  crumbs: Crumb[]
  eyebrow: string
  title: string
  subtitle?: string
  tabs?: MethodTab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  actions?: ReactNode
  children: ReactNode
}

/**
 * Marco compartido de las páginas de alta/edición: migas, cabecera Gabinete,
 * pestañas de método (buscar/manual/…) y el panel de formulario.
 * El acento de colección lo pone la página en su raíz via `--sc`/`--c`; aquí no se aplica color propio.
 *
 * Pestañas accesibles: navegación con flechas/Home/End, roving tabindex
 * (solo la activa es tabulable) y panel asociado con `role="tabpanel"`.
 */
export default function CreateShell({
  crumbs,
  eyebrow,
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
}: CreateShellProps) {
  const uid = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const tabId = (value: string) => `${uid}-tab-${value}`
  const panelId = `${uid}-panel`
  const activeIndex = tabs ? Math.max(0, tabs.findIndex((t) => t.value === activeTab)) : -1

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!tabs?.length) return
    let next = -1
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    onTabChange?.(tabs[next].value)
    tabRefs.current[next]?.focus()
  }

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <div className="rule-double">
        <span className="accent-bar" />
      </div>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions} rule={false} />
      {tabs && (
        <div role="tablist" aria-label="Método de alta" className="method-tabs">
          {tabs.map((tab, index) => {
            const active = tab.value === activeTab
            return (
              <button
                key={tab.value}
                type="button"
                id={tabId(tab.value)}
                role="tab"
                aria-selected={active}
                aria-controls={panelId}
                tabIndex={active ? 0 : -1}
                ref={(el) => { tabRefs.current[index] = el }}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={`method-tab${active ? ' on' : ''}`}
                onClick={() => onTabChange?.(tab.value)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}
      <div
        className="form-panel"
        {...(tabs && activeIndex >= 0
          ? { role: 'tabpanel', id: panelId, 'aria-labelledby': tabId(tabs[activeIndex].value), tabIndex: 0 }
          : {})}
      >
        {children}
      </div>
    </>
  )
}
