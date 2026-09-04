import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Mi colección' },
  { to: '/nuevo', label: 'Añadir libro' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-ambient">
      <nav className="max-w-content mx-auto px-5 md:px-20 h-16 flex items-center gap-8">
        <span className="text-h3-card font-semibold tracking-wide text-ink-black">
          Collection
        </span>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-eyebrow uppercase tracking-wide transition-colors ${
                  isActive ? 'text-signal-orange' : 'text-slate-gray hover:text-ink-black'
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
