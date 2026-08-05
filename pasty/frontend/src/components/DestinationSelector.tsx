import type { Destination } from '../types'
import { Tooltip } from './Tooltip'

interface DestinationSelectorProps {
  selected: Destination
  onChange: (dest: Destination) => void
}

const destinations: {
  id: Destination
  label: string
  icon: string
  description: string
  chip: string
}[] = [
  {
    id: 'docs',
    label: 'Google Docs',
    icon: '📄',
    description: 'Documento formatado',
    chip: 'from-blue-500 to-blue-600',
  },
  {
    id: 'drive',
    label: 'Google Drive',
    icon: '📁',
    description: 'Arquivo de texto na nuvem',
    chip: 'from-amber-500 to-orange-600',
  },
  {
    id: 'gmail',
    label: 'Gmail Draft',
    icon: '✉️',
    description: 'Rascunho de e-mail',
    chip: 'from-red-500 to-rose-600',
  },
]

export function DestinationSelector({ selected, onChange }: DestinationSelectorProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      role="group"
      aria-label="Onde salvar o texto"
    >
      {destinations.map((dest) => {
        const isActive = selected === dest.id
        return (
          <Tooltip key={dest.id} label={`Salvar em ${dest.label} — ${dest.description}`} side="bottom">
            <button
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(dest.id)}
              aria-label={`Salvar em ${dest.label}`}
              className={`group flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-300 ease-out cursor-pointer w-full ${
                isActive
                  ? 'border-violet-500 dark:border-violet-400 bg-violet-50/80 dark:bg-violet-950/40 shadow-lg shadow-violet-200/60 dark:shadow-violet-950/40 scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:shadow-md hover:scale-[1.01]'
              }`}
            >
              <span
                className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${dest.chip} text-white text-lg shadow-md transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
                aria-hidden="true"
              >
                {dest.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {dest.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                  {dest.description}
                </span>
              </span>
              {isActive && (
                <span className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full bg-violet-500 text-white" aria-hidden="true">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
