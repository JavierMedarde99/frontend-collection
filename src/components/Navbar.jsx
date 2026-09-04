import { NavLink } from 'react-router-dom'

const links = [{ to: '/', label: 'Colección de libros' }]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-silver">
      <nav className="max-w-content mx-auto px-5 md:px-20 h-16 flex items-center gap-8">
        <span className="font-display text-heading-sm text-ink">Collection</span>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-body-sm transition-colors ${
                  isActive ? 'text-ink font-semibold' : 'text-graphite hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}