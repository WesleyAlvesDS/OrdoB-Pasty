import { useEffect, useCallback, useState } from 'react'

interface PresentationModeProps {
  text: string
  title: string
  onClose: () => void
}

export function PresentationMode({ text, title, onClose }: PresentationModeProps) {
  const [fontSize, setFontSize] = useState(20)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === '+' || e.key === '=') setFontSize((s) => Math.min(s + 2, 48))
    if (e.key === '-') setFontSize((s) => Math.max(s - 2, 12))
  }, [onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col" role="dialog" aria-label="Modo apresentação" aria-modal="true">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {title || 'Apresentação'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(s - 2, 12))}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            aria-label="Diminuir fonte"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
            </svg>
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums w-8 text-center">{fontSize}px</span>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(s + 2, 48))}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
            aria-label="Aumentar fonte"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </button>
          <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Sair (Esc)
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{title}</h1>
          )}
          <div
            className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          >
            {text}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-center text-[10px] text-gray-400 dark:text-gray-500">
        Pasty — Modo apresentação · + / − para ajustar fonte · Esc para sair
      </div>
    </div>
  )
}