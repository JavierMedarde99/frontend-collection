import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as apiLogin, register as apiRegister, refresh as apiRefresh, updateMe as apiUpdateMe, deleteMe as apiDeleteMe } from '../api/authApi'
import { getActiveCollections, getPreferences } from '../api/preferencesApi'
import type { LoginRequest, RegisterRequest, UserPreferences, UserResponse } from '../types'
import {
  getAuthNavigator,
  readRefreshToken,
  setOnExpiredAuth,
  setStoredAccessToken,
  writeRefreshToken,
} from '../api/authStore'

interface AuthContextValue {
  user: UserResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  initializing: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateProfile: (data: UpdateProfileRequest) => Promise<void>
  deleteAccount: () => Promise<void>
  /** Códigos del backend en mayúsculas: ["BOOKS", "MAGIC", ...]. Vacío si anónimo. */
  activeCollections: string[]
  preferences: UserPreferences | null
  refreshActiveCollections: () => Promise<void>
  refreshPreferences: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [activeCollections, setActiveCollections] = useState<string[]>([])

  const loadPreferences = useCallback(async (userId: string) => {
    try {
      const [prefs, active] = await Promise.all([
        getPreferences(userId).catch(() => null),
        getActiveCollections(userId).catch(() => [] as string[]),
      ])
      setPreferences(prefs)
      setActiveCollections(Array.isArray(active) ? active : [])
    } catch {
      setPreferences(null)
      setActiveCollections([])
    }
  }, [])

  const refreshPreferences = useCallback(async () => {
    if (!user?.id) return
    await loadPreferences(user.id)
  }, [user?.id, loadPreferences])

  const refreshActiveCollections = useCallback(async () => {
    if (!user?.id) return
    try {
      const active = await getActiveCollections(user.id)
      setActiveCollections(Array.isArray(active) ? active : [])
    } catch {
      /* se conserva el último valor conocido */
    }
  }, [user?.id])

  // Restaura la sesión al recargar: el refresh rota tokens y trae el usuario.
  useEffect(() => {
    let cancelled = false
    async function restore() {
      const stored = readRefreshToken()
      if (!stored) {
        setInitializing(false)
        return
      }
      try {
        const res = await apiRefresh(stored)
        if (cancelled) return
        setUser(res.user)
        setAccessToken(res.accessToken)
        setStoredAccessToken(res.accessToken)
        writeRefreshToken(res.refreshToken)
        await loadPreferences(res.user.id)
      } catch {
        if (cancelled) return
        setStoredAccessToken(null)
        writeRefreshToken(null)
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [loadPreferences])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await apiLogin(data)
    setUser(res.user)
    setAccessToken(res.accessToken)
    setStoredAccessToken(res.accessToken)
    writeRefreshToken(res.refreshToken)
    await loadPreferences(res.user.id)
  }, [loadPreferences])

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiRegister(data)
    setUser(res.user)
    setAccessToken(res.accessToken)
    setStoredAccessToken(res.accessToken)
    writeRefreshToken(res.refreshToken)
    await loadPreferences(res.user.id)
  }, [loadPreferences])

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    const updated = await apiUpdateMe(data)
    setUser(updated)
  }, [])

  const deleteAccount = useCallback(async () => {
    await apiDeleteMe()
    setUser(null)
    setAccessToken(null)
    setStoredAccessToken(null)
    writeRefreshToken(null)
    setPreferences(null)
    setActiveCollections([])
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setStoredAccessToken(null)
    writeRefreshToken(null)
    setPreferences(null)
    setActiveCollections([])
  }, [])

  // Restore + token expirado: logout y a /login.
  useEffect(() => {
    setOnExpiredAuth(() => {
      logout()
      getAuthNavigator()?.('/login', { replace: true, state: { expired: true } })
    })
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: user !== null,
      initializing,
      login,
      register,
      logout,
      updateProfile,
      deleteAccount,
      activeCollections,
      preferences,
      refreshActiveCollections,
      refreshPreferences,
    }),
    [user, accessToken, initializing, login, register, logout, updateProfile, deleteAccount, activeCollections, preferences, refreshActiveCollections, refreshPreferences],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
