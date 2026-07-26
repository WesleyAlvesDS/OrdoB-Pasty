import { useState, useEffect } from 'react'
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

const TABS = [
  { id: 'stats', label: 'Estatísticas', icon: '📊', Component: TextStats },
  { id: 'tools', label: 'Limpeza', icon: '🧹', Component: TextCleanup },
  { id: 'export', label: 'Exportar', icon: '📥', Component: TextExport },
  { id: 'detect', label: 'Detectar', icon: '🔍', Component: TextDetect },
  { id: 'templates', label: 'Modelos', icon: '📋', Component: TextTemplates },
] as const

type TabId = (typeof TABS)[number]['id']

export function TextTools({ text, title, onTextChange, onTitleChange }: TextToolsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('stats')

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
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden animate-scale-in">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all duration-200 border-b-2 cursor-pointer ${
                isActive
                  ? 'border-violet-500 text-violet-700 dark:text-violet-300 bg-white dark:bg-gray-900'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {TABS.map((tab) => {
          if (activeTab !== tab.id) return null
          const C = tab.Component
          return (
            <div key={tab.id} className="animate-fade-in">
              {tab.id === 'stats' && <C text={text} />}
              {tab.id === 'tools' && <C text={text} onTextChange={onTextChange} />}
              {tab.id === 'export' && <C text={text} title={title} />}
              {tab.id === 'detect' && <C text={text} />}
              {tab.id === 'templates' && <C text={text} title={title} onTextChange={onTextChange} onTitleChange={onTitleChange} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
