import { useState, useCallback } from 'react'
import { TITLE_TEMPLATES, renderTitleTemplate } from '../utils/title'
import { Tooltip } from './Tooltip'

interface TitleTemplateProps {
  text: string
  onTitleChange: (title: string) => void
}

export function TitleTemplate({ text, onTitleChange }: TitleTemplateProps) {
  const [open, setOpen] = useState(false)

  const applyTemplate = useCallback((template: string) => {
    if (!text.trim()) return
    onTitleChange(renderTitleTemplate(template, text))
    setOpen(false)
  }, [text, onTitleChange])

  return (
    <div className="relative">
      <Tooltip label="Usar template de título">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          Template
        </button>
      </Tooltip>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-64 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl z-20 overflow-hidden animate-scale-in"
        >
          <div className="px-3 py-2 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
            Templates de título
          </div>
          <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
            {TITLE_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                onClick={() => applyTemplate(t.template)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 cursor-pointer text-left"
              >
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t.label}</span>
                <code className="text-[10px] text-violet-500 dark:text-violet-400 font-mono">{t.template}</code>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 text-[9px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
            Dica: {'{{date}}'}, {'{{time}}'}, {'{{first_words}}'}
          </div>
        </div>
      )}
    </div>
  )
}