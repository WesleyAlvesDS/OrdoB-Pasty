import { useEffect, useCallback, useState, useRef } from 'react'

interface PasteFullscreenProps {
  text: string
  onTextChange: (text: string) => void
  onClose: () => void
}

export function PasteFullscreen({ text, onTextChange, onClose }: PasteFullscreenProps) {
  const [draft, setDraft] = useState(text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    textareaRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        onTextChange(draft)
        onClose()
      }
    },
    [draft, onTextChange, onClose],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col"
      role="dialog"
      aria-label="Modo colagem em tela cheia"
      aria-modal="true"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
          </svg>
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            Colar em tela cheia
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:inline mr-1">
            Ctrl+Enter para aplicar · Esc para sair
          </span>
          <button
            type="button"
            onClick={() => {
              onTextChange(draft)
              onClose()
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Textarea expandido */}
      <div className="flex-1 flex flex-col p-4 sm:p-6">
        <label htmlFor="paste-fullscreen-text" className="sr-only">
          Cole seu texto aqui
        </label>
        <textarea
          id="paste-fullscreen-text"
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Cole seu texto aqui... aproveite o espaço maior para colar e editar antes de salvar."
          className="flex-1 w-full px-5 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-300 text-base resize-none shadow-sm"
        />
        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={() => setDraft('')}
            disabled={!draft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            aria-label="Limpar texto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpar
          </button>
          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {draft.length} caractere{draft.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-center text-[10px] text-gray-400 dark:text-gray-500">
        Pasty — Modo colagem em tela cheia · cole e edite com mais espaço · Esc para sair
      </div>
    </div>
  )
}
