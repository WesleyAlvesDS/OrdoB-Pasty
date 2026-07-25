import { useState, useEffect, useCallback, createContext, useContext, useMemo, type ReactNode } from 'react'

// ─── Types ───────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

// ─── Context ─────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

// ─── Icons ───────────────────────────────────────────────────

const ICONS: Record<ToastType, { icon: string; bg: string; border: string }> = {
  success: {
    icon: '✓',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  error: {
    icon: '✕',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
  },
  info: {
    icon: 'ℹ',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
  warning: {
    icon: '⚠',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
}

// ─── Individual Toast ────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { icon, bg, border } = ICONS[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border ${bg} ${border} shadow-lg animate-slide-down max-w-sm w-full`}
    >
      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        aria-label="Fechar notificação"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ─── Provider ────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => setToasts([]), [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notificações"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Convenience hooks (memoized) ───────────────────────────

export function useToastActions() {
  const { addToast } = useToast()

  return useMemo(
    () => ({
      success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
      error: (title: string, message?: string) => addToast({ type: 'error', title, message, duration: 6000 }),
      info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
      warning: (title: string, message?: string) => addToast({ type: 'warning', title, message, duration: 5000 }),
    }),
    [addToast],
  )
}
