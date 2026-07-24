import type { Clip } from '../types'

interface SuccessMessageProps {
  clip: Clip | null
  duplicate: boolean
  error: string | null
  onDismiss: () => void
}

const destinationLabels: Record<string, string> = {
  docs: 'Google Docs',
  drive: 'Google Drive',
  gmail: 'Gmail Draft',
}

const destinationIcons: Record<string, string> = {
  docs: '📄',
  drive: '📁',
  gmail: '✉️',
}

export function SuccessMessage({ clip, duplicate, error, onDismiss }: SuccessMessageProps) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-xl">❌</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Erro ao salvar
            </p>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all duration-200 hover:scale-110 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  if (!clip) return null

  return (
    <div
      className={`rounded-xl border p-4 animate-fade-in ${
        duplicate
          ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40'
          : 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{duplicate ? '⚠️' : '✅'}</span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${
              duplicate
                ? 'text-amber-800 dark:text-amber-300'
                : 'text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {duplicate ? 'Este texto já foi salvo!' : 'Texto salvo com sucesso!'}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{destinationIcons[clip.destination]}</span>
            <span>{destinationLabels[clip.destination]}</span>
          </div>
          {clip.external_url && (
            <a
              href={clip.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-all duration-200 hover:gap-2.5"
            >
              Abrir destino
              <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
