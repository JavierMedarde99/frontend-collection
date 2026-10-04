import type { ReactNode } from 'react'
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
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <div className="rule-double">
        <span className="accent-bar" />
      </div>
      <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions} rule={false} />
      {tabs && (
        <div role="tablist" aria-label="Método de alta" className="method-tabs">
          {tabs.map((tab) => {
            const active = tab.value === activeTab
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={active}
                className={`method-tab${active ? ' on' : ''}`}
                onClick={() => onTabChange?.(tab.value)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}
      <div className="form-panel">{children}</div>
    </>
  )
}