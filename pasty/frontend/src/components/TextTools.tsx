import { useState } from 'react'
import { TextStats } from './TextStats'
import { TextCleanup } from './TextCleanup'
import { TextExport } from './TextExport'
import { TextDetect } from './TextDetect'
import { TextTemplates } from './TextTemplates'

export type ToolKey = 'stats' | 'cleanup' | 'export' | 'detect' | 'templates'
export type ToolSide = 'left' | 'right'

export interface ToolDef {
  key: ToolKey
  label: string
  icon: string
  header: string
  side: ToolSide
}

export const ALL_TOOLS: ToolDef[] = [
  { key: 'stats', label: 'Estatísticas', icon: '📊', header: 'from-violet-500 to-purple-600', side: 'left' },
  { key: 'export', label: 'Exportar', icon: '📥', header: 'from-amber-500 to-orange-600', side: 'left' },
  { key: 'templates', label: 'Modelos', icon: '📋', header: 'from-rose-500 to-pink-600', side: 'left' },
  { key: 'cleanup', label: 'Limpeza', icon: '🧹', header: 'from-emerald-500 to-teal-600', side: 'right' },
  { key: 'detect', label: 'Detectar', icon: '🔍', header: 'from-blue-500 to-indigo-600', side: 'right' },
]

const PREF_KEY = 'pasty_tools_pref'

export function loadToolsPref(): ToolKey[] {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (!raw) return ALL_TOOLS.map((t) => t.key)
    const parsed = JSON.parse(raw) as ToolKey[]
    return ALL_TOOLS.map((t) => t.key).filter((k) => parsed.includes(k))
  } catch {
    return ALL_TOOLS.map((t) => t.key)
  }
}

export function saveToolsPref(enabled: ToolKey[]) {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(enabled))
  } catch {
    /* localStorage unavailable */
  }
}

interface ToolBodyProps {
  def: ToolDef
  text: string
  title: string
  onTextChange: (text: string) => void
  onTitleChange: (title: string) => void
}

function ToolBody({ def, text, title, onTextChange, onTitleChange }: ToolBodyProps) {
  switch (def.key) {
    case 'stats':
      return <TextStats text={text} />
    case 'cleanup':
      return <TextCleanup text={text} onTextChange={onTextChange} />
    case 'export':
      return <TextExport text={text} title={title} />
    case 'detect':
      return <TextDetect text={text} />
    case 'templates':
      return <TextTemplates text={text} onTextChange={onTextChange} onTitleChange={onTitleChange} />
  }
}

export function ToolCard({
  def,
  text,
  title,
  onTextChange,
  onTitleChange,
}: Omit<ToolBodyProps, 'def'> & { def: ToolDef }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`w-full px-4 py-2.5 flex items-center gap-2 bg-gradient-to-r ${def.header} transition-opacity hover:opacity-90 cursor-pointer`}
      >
        <span className="text-sm">{def.icon}</span>
        <span className="text-xs font-semibold text-white flex-1 text-left">{def.label}</span>
        <svg
          className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          open ? 'opacity-100 max-h-[3000px]' : 'opacity-0 max-h-0 overflow-hidden'
        }`}
      >
        <div className="p-4">
          <ToolBody
            def={def}
            text={text}
            title={title}
            onTextChange={onTextChange}
            onTitleChange={onTitleChange}
          />
        </div>
      </div>
    </div>
  )
}

interface TextToolsProps {
  side: ToolSide
  enabled: ToolKey[]
  text: string
  title: string
  onTextChange: (text: string) => void
  onTitleChange: (title: string) => void
}

export function TextTools({ side, enabled, text, title, onTextChange, onTitleChange }: TextToolsProps) {
  const tools = ALL_TOOLS.filter((t) => t.side === side && enabled.includes(t.key))
  if (tools.length === 0) return null

  return (
    <div className="space-y-4 animate-scale-in">
      {tools.map((def) => (
        <ToolCard
          key={def.key}
          def={def}
          text={text}
          title={title}
          onTextChange={onTextChange}
          onTitleChange={onTitleChange}
        />
      ))}
    </div>
  )
}