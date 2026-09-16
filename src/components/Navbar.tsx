import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toBackendCollectionKey } from '../constants/collections'
import ExportButton from './ExportButton'
import ThemeToggle from './ThemeToggle'

const links: { to: string; label: string; end: boolean; collection?: string }[] = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/coleccion', label: 'Libros', end: false, collection: 'books' },
  { to: '/juegos', label: 'Videojuegos', end: false, collection: 'games' },
  { to: '/magic', label: 'Magic', end: false, collection: 'magic' },
  { to: '/boardgames', label: 'Juegos de Mesa', end: false, collection: 'boardgames' },
  { to: '/movieshows', label: 'Películas', end: false, collection: 'movieshows' },
]

const magicLinks: { to: string; label: string; end: boolean; collection?: string }[] = [
  { to: '/magic', label: 'Cartas', end: true, collection: 'magic' },
  { to: '/magic/mazos', label: 'Mazos', end: false, collection: 'decks' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, activeCollections } = useAuth()

  // Anónimo o sin preferencias: todo visible.
  function collectionVisible(collection?: string): boolean {
    if (!collection || !isAuthenticated) return true
    return activeCollections.includes(toBackendCollectionKey(collection))
  }
  const visibleLinks = links.filter((link) => collectionVisible(link.collection))
  const visibleMagicLinks = magicLinks.filter((link) => collectionVisible(link.collection))
  const [menuOpen, setMenuOpen] = useState(false)

  const displayName = user?.displayName || user?.username || ''
  const initial = displayName.slice(0, 1).toUpperCase()

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/', { replace: true })
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const inMagic = location.pathname.startsWith('/magic')

  return (
    <header className="sticky top-0 z-10 bg-navbar-gradient border-b border-silver/70 shadow-sm-4">
      <nav className="px-5 md:px-20 h-16 flex items-center justify-between gap-4">
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
          <div className="hidden lg:flex items-center gap-1">
            {visibleLinks.map((link) => (
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
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <span className="hidden sm:inline-flex">
            <ExportButton />
          </span>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/perfil"
                className="hidden sm:inline-flex items-center gap-2 px-2 py-1 rounded-full hover:bg-brand-soft transition-colors"
                aria-label="Mi perfil"
              >
                <span aria-hidden="true" className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center font-display font-bold text-sm text-white shrink-0">
                  {initial}
                </span>
                <span className="hidden xl:inline text-body-sm font-medium text-graphite max-w-[7rem] truncate">
                  {displayName}
                </span>
              </NavLink>
              <button
                type="button"
                className="btn-ghost !p-2 hidden sm:inline-flex"
                onClick={handleLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
              <NavLink
                to="/preferencias"
                className="btn-ghost !p-2 hidden sm:inline-flex"
                title="Preferencias"
                aria-label="Preferencias"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.378-.073l.762.604a1.125 1.125 0 01.141 1.602l-.53.738c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.53.738a1.125 1.125 0 01-.14 1.602l-.763.605a1.125 1.125 0 01-1.378-.073l-.736-.527c-.35-.25-.806-.272-1.204-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.45.322-1.073.238-1.378-.074l-.762-.604a1.125 1.125 0 01-.14-1.603l.529-.737c.25-.35.272-.806.107-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.559-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.529-.738a1.125 1.125 0 01.14-1.602l.763-.604a1.125 1.125 0 011.378.073l.737.527c.35.25.806.272 1.205.107.397-.165.71-.505.78-.929l.148-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink className="btn-ghost !px-3 !py-2 shrink-0 hidden sm:inline-flex" to="/login">
                Entrar
              </NavLink>
              <NavLink className="btn-primary !px-3 !py-2 shrink-0 hidden sm:inline-flex" to="/register">
                Registrarse
              </NavLink>
            </>
          )}
          <button
            type="button"
            className="btn-ghost !p-2 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <nav id="menu-movil" aria-label="Navegación principal" className="lg:hidden border-t border-silver/70 bg-cream px-5 py-3 animate-fade-in">
          <ul className="flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand text-white shadow-brand-glow font-semibold'
                        : 'text-graphite hover:text-brand hover:bg-brand-soft'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="text-body">{link.label}</span>
                      {isActive && (
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            {isAuthenticated ? (
              <>
                <li>
                  <NavLink
                    to="/perfil"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-graphite hover:text-brand hover:bg-brand-soft"
                  >
                    <span aria-hidden="true" className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center font-display font-bold text-sm text-white shrink-0">
                      {initial}
                    </span>
                    <span className="text-body truncate">{displayName}</span>
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <span className="text-body">Cerrar sesión</span>
                  </button>
                </li>
                <li>
                  <NavLink
                    to="/preferencias"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-graphite hover:text-brand hover:bg-brand-soft"
                  >
                    <span className="text-body">Preferencias</span>
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/login"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-graphite hover:text-brand hover:bg-brand-soft"
                  >
                    <span className="text-body">Iniciar sesión</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/register"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-graphite hover:text-brand hover:bg-brand-soft"
                  >
                    <span className="text-body">Registrarse</span>
                  </NavLink>
                </li>
              </>
            )}
            <li>
              <span className="flex items-center gap-2 px-4 py-2.5">
                <ExportButton onDone={() => setMenuOpen(false)} />
                <span className="text-body text-graphite">Exportar colección</span>
              </span>
            </li>
            <li>
              <span className="flex items-center gap-2 px-4 py-2.5">
                <ThemeToggle className="inline-flex" />
                <span className="text-body text-graphite">Modo oscuro</span>
              </span>
            </li>
            {inMagic && (
              <li className="flex items-center gap-2 pl-4 pt-1" aria-label="Sub-apartados de Magic">
                {visibleMagicLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `text-body-sm px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-ink text-white font-semibold'
                          : 'text-graphite hover:text-brand hover:bg-brand-soft'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </li>
            )}
          </ul>
        </nav>
      )}
      {inMagic && (
        <nav aria-label="Sub-apartados de Magic" className="hidden lg:block border-t border-silver/70 bg-cream/60">
          <div className="px-5 md:px-20 py-2 flex items-center gap-1">
            {visibleMagicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-body-sm px-3 py-1 rounded-full font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-ink text-white'
                      : 'text-graphite hover:text-brand hover:bg-brand-soft'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}