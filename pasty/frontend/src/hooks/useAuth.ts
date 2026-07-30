import { useState, useEffect, useCallback } from 'react'
import type { User } from '../types'
import { getMe, exchangeCode } from '../api'

const TOKEN_KEY = 'utc_token'
const USER_KEY = 'utc_user'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore and verify session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)

    if (savedToken && savedUser) {
      // Set optimistic state first
      setToken(savedToken)
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
        setLoading(false)
        return
      }

      // Verify token is still valid
      getMe(savedToken)
        .then((userData) => {
          setUser(userData)
          localStorage.setItem(USER_KEY, JSON.stringify(userData))
        })
        .catch(() => {
          // Token invalid — clear session
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    // Listen for auth:expired events from api.ts interceptor
    const handleAuthExpired = () => {
      console.log('[useAuth] auth:expired event received — clearing session')
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:expired', handleAuthExpired)
    return () => window.removeEventListener('auth:expired', handleAuthExpired)
  }, [])

  /** Handle OAuth callback — exchange code for JWT */
  const handleCallback = useCallback(async (code: string, state?: string) => {
    const response = await exchangeCode(code, state)
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
    return response.user
  }, [])

  /** Logout — clear session */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    handleCallback,
    logout,
  }
}
