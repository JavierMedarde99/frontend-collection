import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/coleccion', label: 'Mi colección', end: false },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-navbar-gradient border-b border-silver/70 shadow-sm-4">
      <nav className="max-w-content mx-auto px-5 md:px-20 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Collection — inicio">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-accent flex items-center justify-center shadow-brand-glow">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <span className="font-display text-heading-sm text-ink tracking-tight hidden sm:inline-block">
              Collection
            </span>
          </NavLink>
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-body-sm px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand text-white shadow-brand-glow'
                      : 'text-graphite hover:text-brand hover:bg-brand-soft'
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