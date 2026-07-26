import { useCallback } from 'react'

interface TextCleanupProps {
  text: string
  onTextChange: (text: string) => void
}

const cleanupActions = [
  { label: 'Remover espaços extras', desc: 'Remove espaços duplicados e trim', icon: '🔲', fn: (s: string) => s.replace(/\s+/g, ' ').trim() },
  { label: 'Remover linhas vazias', desc: 'Apaga linhas em branco consecutivas', icon: '📄', fn: (s: string) => s.replace(/\n\s*\n/g, '\n').trim() },
  { label: 'MAIÚSCULAS', desc: 'Converte todo o texto para maiúsculas', icon: '🔤', fn: (s: string) => s.toUpperCase() },
  { label: 'minúsculas', desc: 'Converte todo o texto para minúsculas', icon: '🔡', fn: (s: string) => s.toLowerCase() },
  { label: 'Title Case', desc: 'Primeira letra de cada palavra em maiúscula', icon: 'Aa', fn: (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) },
  { label: 'Inverter texto', desc: 'Inverte a ordem dos caracteres', icon: '↩️', fn: (s: string) => s.split('').reverse().join('') },
  { label: 'Remover números', desc: 'Remove todos os dígitos', icon: '#️⃣', fn: (s: string) => s.replace(/[0-9]/g, '') },
  { label: 'Remover pontuação', desc: 'Remove sinais de pontuação', icon: '❗', fn: (s: string) => s.replace(/[^\w\sáéíóúâêîôûàèìòùäëïöüãõç]/g, '') },
]

export function TextCleanup({ text, onTextChange }: TextCleanupProps) {
  const applyCleanup = useCallback((fn: (s: string) => string) => {
    onTextChange(fn(text))
  }, [text, onTextChange])

  if (!text.trim()) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500">
        <span className="text-3xl block mb-2">🧹</span>
        <p className="text-sm">Cole um texto para usar as ferramentas</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {cleanupActions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => applyCleanup(action.fn)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:shadow-sm transition-all duration-200 text-left cursor-pointer group"
        >
          <span className="text-base flex-shrink-0 w-7 h-7 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">{action.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500">{action.desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
