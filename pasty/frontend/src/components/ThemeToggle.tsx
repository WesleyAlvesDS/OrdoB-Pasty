import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pasty-theme') as Theme) || 'system'
    }
    return 'system'
  })

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    root.classList.toggle('dark', isDark)
    root.classList.toggle('light', !isDark)
    root.style.colorScheme = isDark ? 'dark' : 'light'
  }, [])

  useEffect(() => {
    setMounted(true)
    applyTheme(theme)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') applyTheme('system')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, applyTheme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('pasty-theme', t)
    applyTheme(t)
  }, [applyTheme])

  // Prevent hydration flash
  if (!mounted) return <div className="w-9 h-9" aria-hidden="true" />

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" role="radiogroup" aria-label="Tema do site">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
          !isDark && theme !== 'system'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-500'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        role="radio"
        aria-checked={!isDark && theme !== 'system'}
        aria-label="Tema claro"
        title="Tema claro"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-violet-500'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        role="radio"
        aria-checked={theme === 'system'}
        aria-label="Tema automático (sistema)"
        title="Automático"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
          isDark && theme !== 'system'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-400'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
        role="radio"
        aria-checked={isDark && theme !== 'system'}
        aria-label="Tema escuro"
        title="Tema escuro"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>
  )
}
