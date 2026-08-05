import { useState, useCallback } from 'react'

interface TextExportProps {
  text: string
  title: string
}

export function TextExport({ text, title }: TextExportProps) {
  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const downloadAsFile = useCallback((format: 'txt' | 'md' | 'html') => {
    const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    const content = format === 'html'
      ? `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title || 'Pasty'}</title></head><body><pre>${escapedText}</pre></body></html>`
      : text
    const mime = format === 'html' ? 'text/html' : 'text/plain'
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${title?.slice(0, 50) || 'pasty-texto'}.${format}`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, [text, title])

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  const generateShareLink = useCallback(() => {
    const MAX = 5000
    if (text.length > MAX) {
      alert(`Texto muito longo (${text.length} caracteres). Limite: ${MAX}.`) // eslint-disable-line no-alert
      return
    }
    const encoded = btoa(encodeURIComponent(text))
    setShareLink(`${window.location.origin}/#share=${encoded}`)
  }, [text])

  const copyShareLink = useCallback(async () => {
    if (!shareLink) return
    try {
      await navigator.clipboard.writeText(shareLink)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch { /* fallback */ }
  }, [shareLink])

  const downloadOpts = [
    { format: 'txt' as const, label: 'Texto (.txt)', icon: '📄', from: '#3B82F6', to: '#2563EB' },
    { format: 'md' as const, label: 'Markdown (.md)', icon: '📝', from: '#10B981', to: '#059669' },
    { format: 'html' as const, label: 'HTML (.html)', icon: '🌐', from: '#F97316', to: '#EA580C' },
  ]

  if (!text.trim()) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500">
        <span className="text-3xl block mb-2">📥</span>
        <p className="text-sm">Cole um texto para exportar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Download */}
      <div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">Download</p>
        <div className="grid grid-cols-3 gap-2">
          {downloadOpts.map((opt) => (
            <button key={opt.format} type="button" onClick={() => downloadAsFile(opt.format)}
              className="flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer min-w-0"
              style={{ background: `linear-gradient(135deg, ${opt.from}, ${opt.to})` }}
            >
              <span className="text-lg">{opt.icon}</span>
              <span className="text-[9px] font-medium text-center leading-tight truncate w-full">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Copy */}
      <div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">Área de transferência</p>
        <button type="button" onClick={copyToClipboard}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 cursor-pointer group"
        >
          {copied ? (
            <><span className="text-green-500">✅</span><span className="text-sm font-medium text-green-600 dark:text-green-400">Copiado!</span></>
          ) : (
            <>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Copiar texto</span>
            </>
          )}
          <span className="text-[9px] text-gray-400 dark:text-gray-500">{text.length} caracteres</span>
        </button>
      </div>

      {/* Pastebin */}
      <div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">Compartilhar (Pastebin)</p>
        {!shareLink ? (
          <button type="button" onClick={generateShareLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Gerar link para compartilhar
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <input type="text" readOnly value={shareLink} className="flex-1 bg-transparent text-xs text-gray-600 dark:text-gray-400 font-mono px-2 py-1 focus:outline-none" />
              <button type="button" onClick={copyShareLink} className="px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-medium hover:bg-violet-200 dark:hover:bg-violet-950/70 transition-colors cursor-pointer">
                {shareCopied ? '✅' : 'Copiar'}
              </button>
            </div>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center">O texto fica codificado no link · ninguém mais vê</p>
          </div>
        )}
      </div>
    </div>
  )
}
