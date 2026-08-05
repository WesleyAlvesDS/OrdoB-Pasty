import { useMemo } from 'react'

interface TextStatsProps {
  text: string
}

export function TextStats({ text }: TextStatsProps) {
  const stats = useMemo(() => {
    const trimmed = text.trim()
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    const lines = text ? text.split('\n').length : 0
    const sentences = trimmed ? trimmed.split(/[.!?]+\s/).filter(Boolean).length : 0
    const paragraphs = trimmed ? text.split(/\n\s*\n/).filter(Boolean).length : 0
    const readingTime = Math.max(1, Math.ceil(words / 200))
    const speakingTime = Math.max(1, Math.ceil(words / 150))

    const wordFreq = new Map<string, number>()
    trimmed.toLowerCase().split(/\s+/).forEach((w) => {
      const clean = w.replace(/[^a-záéíóúâêîôûàèìòùäëïöüãõç0-9]/g, '')
      if (clean) wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1)
    })
    const uniqueWords = wordFreq.size
    const topWords = [...wordFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    return { chars, charsNoSpace, words, lines, sentences, paragraphs, readingTime, speakingTime, uniqueWords, topWords }
  }, [text])

  if (!text.trim()) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500">
        <span className="text-3xl block mb-2">📊</span>
        <p className="text-sm">Cole um texto para ver as estatísticas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Palavras', value: stats.words.toLocaleString(), icon: '📝', color: 'text-violet-600 dark:text-violet-400' },
          { label: 'Caracteres', value: stats.chars.toLocaleString(), icon: '🔤', color: 'text-blue-600 dark:text-blue-400' },
          { label: 'C/ espaço', value: stats.charsNoSpace.toLocaleString(), icon: '✏️', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Linhas', value: stats.lines.toLocaleString(), icon: '📄', color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Frases', value: stats.sentences.toLocaleString(), icon: '📝', color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Parágrafos', value: stats.paragraphs.toLocaleString(), icon: '📑', color: 'text-cyan-600 dark:text-cyan-400' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <span className="text-lg mb-1">{stat.icon}</span>
            <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-100 dark:border-violet-900">
        <div className="flex items-center gap-3">
          <span className="text-xl">⏱️</span>
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Tempo de leitura</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{stats.uniqueWords} palavras únicas</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{stats.readingTime} min</p>
          <p className="text-[9px] text-gray-400 dark:text-gray-500">~{stats.speakingTime} min falando</p>
        </div>
      </div>

      {stats.topWords.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">Palavras mais frequentes</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.topWords.map(([word, count]) => (
              <span key={word} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 max-w-full">
                <span className="min-w-0 break-all leading-tight">{word}</span>
                <span className="font-bold text-violet-500 flex-shrink-0">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
