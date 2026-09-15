import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as apiLogin, register as apiRegister, refresh as apiRefresh } from '../api/authApi'
import type { LoginRequest, RegisterRequest, UserResponse } from '../types'

const REFRESH_TOKEN_KEY = 'collection.refreshToken'

export function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

function writeRefreshToken(token: string | null) {
  try {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token)
    else localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    /* almacenamiento no disponible: la sesión vive solo en memoria */
  }
}

interface AuthContextValue {
  user: UserResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  initializing: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

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
        writeRefreshToken(res.refreshToken)
      } catch {
        if (cancelled) return
        writeRefreshToken(null)
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await apiLogin(data)
    setUser(res.user)
    setAccessToken(res.accessToken)
    writeRefreshToken(res.refreshToken)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiRegister(data)
    setUser(res.user)
    setAccessToken(res.accessToken)
    writeRefreshToken(res.refreshToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    writeRefreshToken(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: user !== null,
      initializing,
      login,
      register,
      logout,
    }),
    [user, accessToken, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
