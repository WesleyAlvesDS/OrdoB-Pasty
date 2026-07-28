import { useEffect } from 'react'
import { TextStats } from './TextStats'
import { TextCleanup } from './TextCleanup'
import { TextExport } from './TextExport'
import { TextDetect } from './TextDetect'
import { TextTemplates } from './TextTemplates'

interface TextToolsProps {
  text: string
  title: string
  onTextChange: (text: string) => void
  onTitleChange: (title: string) => void
}

export function TextTools({ text, title, onTextChange, onTitleChange }: TextToolsProps) {
  // Detect pastebin shared link on mount
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#share=')) {
      try {
        const encoded = hash.replace('#share=', '')
        const decoded = decodeURIComponent(atob(encoded))
        if (decoded && decoded !== text) {
          onTextChange(decoded)
          window.location.hash = ''
        }
      } catch {
        // Invalid share link
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4 animate-scale-in">
      {/* Estatísticas */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600">
          <span className="text-sm">📊</span>
          <span className="text-xs font-semibold text-white">Estatísticas</span>
        </div>
        <div className="p-4">
          <TextStats text={text} />
        </div>
      </div>

      {/* Limpeza */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600">
          <span className="text-sm">🧹</span>
          <span className="text-xs font-semibold text-white">Limpeza</span>
        </div>
        <div className="p-4">
          <TextCleanup text={text} onTextChange={onTextChange} />
        </div>
      </div>

      {/* Exportar */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600">
          <span className="text-sm">📥</span>
          <span className="text-xs font-semibold text-white">Exportar</span>
        </div>
        <div className="p-4">
          <TextExport text={text} title={title} />
        </div>
      </div>

      {/* Detectar */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600">
          <span className="text-sm">🔍</span>
          <span className="text-xs font-semibold text-white">Detectar</span>
        </div>
        <div className="p-4">
          <TextDetect text={text} />
        </div>
      </div>

      {/* Modelos */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600">
          <span className="text-sm">📋</span>
          <span className="text-xs font-semibold text-white">Modelos</span>
        </div>
        <div className="p-4">
          <TextTemplates text={text} onTextChange={onTextChange} onTitleChange={onTitleChange} />
        </div>
      </div>
    </div>
  )
}
