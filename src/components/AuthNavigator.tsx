import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuthNavigator } from '../api/authStore'

/** Registra navigate en el store para redirigir fuera de React (p. ej. 401). */
export default function AuthNavigator() {
  const navigate = useNavigate()
  useEffect(() => {
    setAuthNavigator((to, options) => navigate(to, options))
  }, [navigate])
  return null
}
