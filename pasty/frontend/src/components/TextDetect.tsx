import { useMemo } from 'react'

interface TextDetectProps {
  text: string
}

export function TextDetect({ text }: TextDetectProps) {
  const detections = useMemo(() => {
    const result: { type: string; icon: string; items: string[] }[] = []

    const urls = text.match(/https?:\/\/[^\s]+/g) || []
    if (urls.length > 0) result.push({ type: 'URLs', icon: '🔗', items: urls.slice(0, 5) })

    const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
    if (emails.length > 0) result.push({ type: 'E-mails', icon: '📧', items: emails.slice(0, 5) })

    const phones = text.match(/(?:\+?55)?[\s]?(?:\(?\d{2}\)?[\s]?)?\d{4,5}[-.\s]?\d{4}/g) || []
    if (phones.length > 0) result.push({ type: 'Telefones', icon: '📞', items: phones.slice(0, 5) })

    const lines = text.split('\n')
    const codeLines = lines.filter((l) => /^(?: {2,}|\t+|function|const|let|var|import|export|class|def|public|private|<[a-z])/.test(l))
    if (codeLines.length > 3) result.push({ type: 'Código detectado', icon: '💻', items: [`${codeLines.length} linhas de código`] })

    const hashtags = text.match(/#[a-zA-Z0-9_]+/g) || []
    if (hashtags.length > 0) result.push({ type: 'Hashtags', icon: '#️⃣', items: hashtags.slice(0, 5) })

    return result
  }, [text])

  if (!text.trim()) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500">
        <span className="text-3xl block mb-2">🔍</span>
        <p className="text-sm">Cole um texto para detectar padrões</p>
      </div>
    )
  }

  if (detections.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500">
        <span className="text-2xl block mb-2">✅</span>
        <p className="text-sm">Nenhum padrão detectado</p>
        <p className="text-[10px] text-gray-400 mt-1">URLs, emails, telefones ou código</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {detections.map((det) => (
        <div key={det.type} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{det.icon}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{det.type}</span>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 ml-auto">
              {det.items.length} encontrado{det.items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1">
            {det.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-1.5" />
                {item.startsWith('http') ? (
                  <a href={item} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-mono min-w-0 break-all leading-relaxed">{item}</a>
                ) : (
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 font-mono min-w-0 break-all leading-relaxed">{item}</span>
                )}
                <button type="button" onClick={() => navigator.clipboard.writeText(item)}
                  className="ml-auto text-[9px] text-gray-400 hover:text-violet-500 transition-colors flex-shrink-0 cursor-pointer mt-0.5" title="Copiar">📋</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
