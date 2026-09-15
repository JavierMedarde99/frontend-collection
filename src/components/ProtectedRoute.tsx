import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

/** Solo usuarios autenticados; si no, a /login guardando el origen. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Comprobando sesión…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const from = location.pathname + location.search
    return <Navigate to="/login" replace state={{ from }} />
  }

  return <>{children}</>
}
