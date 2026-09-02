import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Mi colección' },
  { to: '/nuevo', label: 'Añadir libro' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-studio-white shadow-float">
      <nav className="max-w-[1440px] mx-auto px-5 md:px-20 h-16 flex items-center gap-8">
        <span className="text-headline-md font-semibold tracking-wide text-on-surface">
          Collection
        </span>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-label-sm uppercase tracking-wide transition-colors ${
                  isActive ? 'text-digital-blue' : 'text-on-surface-variant hover:text-on-surface'
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
