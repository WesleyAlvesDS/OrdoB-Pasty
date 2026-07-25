import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToastActions } from './Toast'
import { getMe } from '../api'

interface AuthGuardProps {
  token: string | null
  user: { name?: string | null; email: string } | null
  isAuthenticated: boolean
  onLogout: () => void
}

export function LogoutDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar saída"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 max-w-sm w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
          Sair do Pasty
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Você precisará fazer login novamente para salvar textos.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saindo...
              </>
            ) : (
              'Sair'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SessionStatus({
  token,
  isAuthenticated,
  onLogout,
}: {
  token: string | null
  isAuthenticated: boolean
  onLogout: () => void
}) {
  const [sessionExpiring, setSessionExpiring] = useState(false)
  const navigate = useNavigate()
  const toast = useToastActions()

  // Check session health periodically
  useEffect(() => {
    if (!token || !isAuthenticated) return

    const check = async () => {
      try {
        await getMe(token)
      } catch {
        setSessionExpiring(true)
      }
    }

    // Check every 10 minutes
    const interval = setInterval(check, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [token, isAuthenticated])

  // Auto-logout on session expiry
  useEffect(() => {
    if (!sessionExpiring) return

    toast.warning(
      'Sessão expirada',
      'Sua sessão expirou. Faça login novamente para continuar.',
    )

    const timer = setTimeout(() => {
      onLogout()
      navigate('/', { replace: true })
    }, 3000)

    return () => clearTimeout(timer)
  }, [sessionExpiring, onLogout, navigate, toast])

  return null
}
