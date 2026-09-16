import { useAuth } from '../context/AuthContext'

/**
 * Atajos sobre las preferencias: si una colección está activa
 * y si es pública. Anónimo: todo activo (el backend decide).
 */
export function useCollectionPreferences() {
  const { preferences, refreshPreferences } = useAuth()

  function isCollectionActive(type: string): boolean {
    const active = preferences?.activeCollections
    if (!active) return true
    return active[type] ?? active[type.toLowerCase()] ?? true
  }

  function isCollectionPublic(type: string): boolean {
    const visibility = preferences?.collectionVisibility
    if (!visibility) return true
    const value = visibility[type] ?? visibility[type.toLowerCase()]
    return value === undefined || value === 'PUBLIC'
  }

  return { preferences, refreshPreferences, isCollectionActive, isCollectionPublic }
}
