import type { Destination } from '../types'

interface DestinationSelectorProps {
  selected: Destination
  onChange: (dest: Destination) => void
}

const destinations: { id: Destination; label: string; icon: string }[] = [
  { id: 'docs', label: 'Google Docs', icon: '📄' },
  { id: 'drive', label: 'Google Drive', icon: '📁' },
  { id: 'gmail', label: 'Gmail Draft', icon: '✉️' },
]

export function DestinationSelector({ selected, onChange }: DestinationSelectorProps) {
  return (
    <div className="flex gap-2">
      {destinations.map((dest) => {
        const isActive = selected === dest.id
        return (
          <button
            key={dest.id}
            type="button"
            onClick={() => onChange(dest.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ease-out cursor-pointer ${
              isActive
                ? 'border-violet-500 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 shadow-md shadow-violet-200/50 dark:shadow-violet-950/50 scale-[1.02]'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:text-violet-600 dark:hover:text-violet-400 hover:shadow-sm hover:scale-[1.01]'
            }`}
          >
            <span className={`text-base transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
              {dest.icon}
            </span>
            {dest.label}
          </button>
        )
      })}
    </div>
  )
}
