import { Fragment } from 'react'
import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-caption text-graphite">
        {items.map((item, i) => {
          const last = i === items.length - 1
          // En móvil solo se muestran los 2 últimos niveles
          const responsive = i < items.length - 2 ? 'hidden sm:flex' : 'flex'
          return (
            <Fragment key={`${item.label}-${i}`}>
              {i > 0 && (
                <li aria-hidden="true" className={`text-stone ${responsive}`}>
                  /
                </li>
              )}
              <li className={`items-center ${responsive}`}>
                {item.to && !last ? (
                  <Link to={item.to} className="hover:text-brand hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className={last ? 'text-ink font-semibold' : ''}>
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
