import { NavLink } from 'react-router-dom'

const links = [{ to: '/', label: 'Colección de libros' }]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-silver shadow-sm-4">
      <nav className="max-w-content mx-auto px-5 md:px-20 h-16 flex items-center justify-between gap-8">
        <div className="flex items-center gap-8 min-w-0">
          <span className="font-display text-heading-sm text-ink tracking-tight">
            Collection
          </span>
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-body-sm px-3 py-1.5 rounded-pill transition-colors ${
                    isActive
                      ? 'bg-paper text-ink font-semibold'
                      : 'text-graphite hover:text-ink hover:bg-paper'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
        <NavLink className="btn-primary !px-4 !py-2 shrink-0" to="/nuevo">
          Añadir libro
        </NavLink>
      </nav>
    </header>
  )
}