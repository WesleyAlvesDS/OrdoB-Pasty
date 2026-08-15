interface TextBoxProps {
  text: string
  onTextChange: (text: string) => void
  onOpenFullscreen?: () => void
  id?: string
  autoFocus?: boolean
}

export function TextBox({ text, onTextChange, onOpenFullscreen, id = 'paste-text', autoFocus = false }: TextBoxProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="sr-only">
          Cole seu texto aqui
        </label>
        {onOpenFullscreen && (
          <button
            type="button"
            onClick={onOpenFullscreen}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200 cursor-pointer"
            aria-label="Abrir modo de colagem em tela cheia"
            title="Aumentar área de colagem"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M17 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" />
            </svg>
            Tela cheia
          </button>
        )}
      </div>
      <textarea
        id={id}
        name="paste-text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Cole seu texto aqui..."
        rows={10}
        autoFocus={autoFocus}
        className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-300 text-base resize-y min-h-[240px] shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600"
      />
      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={() => onTextChange('')}
          disabled={!text}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-500 dark:disabled:hover:text-gray-400 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:bg-transparent transition-all duration-200 cursor-pointer"
          aria-label="Limpar texto"
          title="Limpar texto"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpar
        </button>
        <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
          {text.length} caractere{text.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
