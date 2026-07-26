import { useState, useMemo, useCallback, useEffect } from 'react'

// ─── Types ──────────────────────────────────────────────────

interface TextToolsProps {
  text: string
  title: string
  onTextChange: (text: string) => void
  onTitleChange: (title: string) => void
}

interface Template {
  id: string
  name: string
  content: string
  createdAt: number
}

// ─── Templates Storage ─────────────────────────────────────

const TEMPLATES_KEY = 'pasty_templates'

function loadTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTemplates(templates: Template[]) {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  } catch {
    // Storage full
  }
}

// ─── Component ──────────────────────────────────────────────

const TABS = [
  { id: 'stats', label: 'Estatísticas', icon: '📊' },
  { id: 'tools', label: 'Limpeza', icon: '🧹' },
  { id: 'export', label: 'Exportar', icon: '📥' },
  { id: 'detect', label: 'Detectar', icon: '🔍' },
  { id: 'templates', label: 'Modelos', icon: '📋' },
] as const

type TabId = (typeof TABS)[number]['id']

export function TextTools({ text, title, onTextChange, onTitleChange }: TextToolsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('stats')
  const [copied, setCopied] = useState(false)
  const [templates, setTemplatesState] = useState<Template[]>(loadTemplates)
  const [templateName, setTemplateName] = useState('')
  const [showSavedToast, setShowSavedToast] = useState<string | null>(null)

  // Persist templates
  useEffect(() => {
    saveTemplates(templates)
  }, [templates])

  // ─── Statistics ──────────────────────────────────────────

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

    // Unique words
    const wordFreq = new Map<string, number>()
    trimmed.toLowerCase().split(/\s+/).forEach((w) => {
      const clean = w.replace(/[^a-záéíóúâêîôûàèìòùäëïöüãõç0-9]/g, '')
      if (clean) wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1)
    })
    const uniqueWords = wordFreq.size
    const topWords = [...wordFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    return {
      chars,
      charsNoSpace,
      words,
      lines,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      uniqueWords,
      topWords,
    }
  }, [text])

  // ─── Cleanup Handlers ────────────────────────────────────

  const applyCleanup = useCallback((fn: (s: string) => string) => {
    onTextChange(fn(text))
  }, [text, onTextChange])

  const cleanupActions = [
    {
      label: 'Remover espaços extras',
      desc: 'Remove espaços duplicados e trim',
      action: () => applyCleanup((s) => s.replace(/\s+/g, ' ').trim()),
      icon: '🔲',
    },
    {
      label: 'Remover linhas vazias',
      desc: 'Apaga linhas em branco consecutivas',
      action: () => applyCleanup((s) => s.replace(/\n\s*\n/g, '\n').trim()),
      icon: '📄',
    },
    {
      label: 'MAIÚSCULAS',
      desc: 'Converte todo o texto para maiúsculas',
      action: () => applyCleanup((s) => s.toUpperCase()),
      icon: '🔤',
    },
    {
      label: 'minúsculas',
      desc: 'Converte todo o texto para minúsculas',
      action: () => applyCleanup((s) => s.toLowerCase()),
      icon: '🔡',
    },
    {
      label: 'Title Case',
      desc: 'Primeira letra de cada palavra em maiúscula',
      action: () =>
        applyCleanup((s) =>
          s.replace(/\w\S*/g, (w) =>
            w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
          ),
        ),
      icon: 'Aa',
    },
    {
      label: 'Inverter texto',
      desc: 'Inverte a ordem dos caracteres',
      action: () => applyCleanup((s) => s.split('').reverse().join('')),
      icon: '↩️',
    },
    {
      label: 'Remover números',
      desc: 'Remove todos os dígitos',
      action: () => applyCleanup((s) => s.replace(/[0-9]/g, '')),
      icon: '#️⃣',
    },
    {
      label: 'Remover pontuação',
      desc: 'Remove sinais de pontuação',
      action: () => applyCleanup((s) => s.replace(/[^\w\sáéíóúâêîôûàèìòùäëïöüãõç]/g, '')),
      icon: '❗',
    },
  ]

  // ─── Export Handlers ──────────────────────────────────────

  const downloadAsFile = useCallback((format: 'txt' | 'md' | 'html') => {
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    const content = format === 'html'
      ? `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title || 'Pasty'}</title></head><body><pre>${escapedText}</pre></body></html>`
      : text
    const ext = format
    const mime = format === 'html' ? 'text/html' : 'text/plain'
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${title?.slice(0, 50) || 'pasty-texto'}.${ext}`
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
      // Fallback
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

  // ─── Smart Detection ─────────────────────────────────────

  const detections = useMemo(() => {
    const result: { type: string; icon: string; items: string[]; color: string }[] = []

    // URLs
    const urls = text.match(/https?:\/\/[^\s]+/g) || []
    if (urls.length > 0) {
      result.push({ type: 'URLs', icon: '🔗', items: urls.slice(0, 5), color: 'blue' })
    }

    // Emails
    const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
    if (emails.length > 0) {
      result.push({ type: 'E-mails', icon: '📧', items: emails.slice(0, 5), color: 'emerald' })
    }

    // Phone numbers (Brazilian format)
    const phones = text.match(/(?:\+?55)?[\s]?(?:\(?\d{2}\)?[\s]?)?\d{4,5}[-.\s]?\d{4}/g) || []
    if (phones.length > 0) {
      result.push({ type: 'Telefones', icon: '📞', items: phones.slice(0, 5), color: 'violet' })
    }

    // Code blocks (lines with indentation or code-like patterns)
    const lines = text.split('\n')
    const codeLines = lines.filter((l) =>
      /^(?: {2,}|\t+|function|const|let|var|import|export|class|def|public|private|<[a-z])/.test(l),
    )
    if (codeLines.length > 3) {
      result.push({
        type: 'Código detectado',
        icon: '💻',
        items: [`${codeLines.length} linhas de código`],
        color: 'amber',
      })
    }

    // Hashtags
    const hashtags = text.match(/#[a-zA-Z0-9_]+/g) || []
    if (hashtags.length > 0) {
      result.push({ type: 'Hashtags', icon: '#️⃣', items: hashtags.slice(0, 5), color: 'pink' })
    }

    return result
  }, [text])

  // ─── Template Handlers ────────────────────────────────────

  const saveAsTemplate = useCallback(() => {
    if (!text.trim() || !templateName.trim()) return
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateName.trim(),
      content: text,
      createdAt: Date.now(),
    }
    setTemplatesState((prev) => [newTemplate, ...prev])
    setTemplateName('')
    setShowSavedToast('Modelo salvo!')
    setTimeout(() => setShowSavedToast(null), 2000)
  }, [text, templateName])

  const loadTemplate = useCallback((template: Template) => {
    onTextChange(template.content)
    onTitleChange(template.name)
  }, [onTextChange, onTitleChange])

  const deleteTemplate = useCallback((id: string) => {
    setTemplatesState((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ─── Pastebin ────────────────────────────────────────────

  const [shareLink, setShareLink] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const generateShareLink = useCallback(() => {
    const MAX_LENGTH = 5000 // URL length safety limit
    if (text.length > MAX_LENGTH) {
      alert(`Texto muito longo (${text.length} caracteres). O limite para compartilhar via link é de ${MAX_LENGTH} caracteres.`) // eslint-disable-line no-alert
      return
    }
    const encoded = btoa(encodeURIComponent(text))
    const url = `${window.location.origin}/#share=${encoded}`
    setShareLink(url)
  }, [text])

  // Check if opened from a shared link
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

  const copyShareLink = useCallback(async () => {
    if (!shareLink) return
    try {
      await navigator.clipboard.writeText(shareLink)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // Fallback
    }
  }, [shareLink])

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden animate-scale-in">
      {/* ─── Tab Navigation ────────────────────────────── */}
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

      {/* ─── Tab Content ───────────────────────────────── */}
      <div className="p-4">
        {activeTab === 'stats' && !text.trim() && (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
            <span className="text-3xl block mb-2">📊</span>
            <p className="text-sm">Cole um texto para ver as estatísticas</p>
          </div>
        )}

        {activeTab === 'stats' && text.trim() && (
          <div className="space-y-4">
            {/* Main stats grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Palavras', value: stats.words.toLocaleString(), icon: '📝', color: 'text-violet-600 dark:text-violet-400' },
                { label: 'Caracteres', value: stats.chars.toLocaleString(), icon: '🔤', color: 'text-blue-600 dark:text-blue-400' },
                { label: 'C/ espaço', value: stats.charsNoSpace.toLocaleString(), icon: '✏️', color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Linhas', value: stats.lines.toLocaleString(), icon: '📄', color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Frases', value: stats.sentences.toLocaleString(), icon: '📝', color: 'text-rose-600 dark:text-rose-400' },
                { label: 'Parágrafos', value: stats.paragraphs.toLocaleString(), icon: '📑', color: 'text-cyan-600 dark:text-cyan-400' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                >
                  <span className="text-lg mb-1">{stat.icon}</span>
                  <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Reading time */}
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

            {/* Top words */}
            {stats.topWords.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">
                  Palavras mais frequentes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {stats.topWords.map(([word, count]) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                    >
                      {word}
                      <span className="font-bold text-violet-500">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TOOLS TAB ───────────────────────────────── */}
        {activeTab === 'tools' && (
          <div>
            {!text.trim() ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                <span className="text-3xl block mb-2">🧹</span>
                <p className="text-sm">Cole um texto para usar as ferramentas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cleanupActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.action}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:shadow-sm transition-all duration-200 text-left cursor-pointer group"
                  >
                    <span className="text-base flex-shrink-0 w-7 h-7 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      {action.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</p>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── EXPORT TAB ──────────────────────────────── */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            {!text.trim() ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                <span className="text-3xl block mb-2">📥</span>
                <p className="text-sm">Cole um texto para exportar</p>
              </div>
            ) : (
              <>
                {/* Download */}
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">
                    Download
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[                    {format: 'txt' as const, label: 'Texto (.txt)', icon: '📄' },
                      { format: 'md' as const, label: 'Markdown (.md)', icon: '📝' },
                      { format: 'html' as const, label: 'HTML (.html)', icon: '🌐' },
                    ].map((opt) => {
                      const fromColor = opt.format === 'txt' ? '#3B82F6' : opt.format === 'md' ? '#10B981' : '#F97316'
                      const toColor = opt.format === 'txt' ? '#2563EB' : opt.format === 'md' ? '#059669' : '#EA580C'
                      return (
                        <button
                          key={opt.format}
                          type="button"
                          onClick={() => downloadAsFile(opt.format)}
                          className="flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                          style={{
                            background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
                          }}
                        >
                          <span className="text-lg">{opt.icon}</span>
                          <span className="text-[9px] font-medium text-center leading-tight">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Copy */}
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">
                    Área de transferência
                  </p>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 cursor-pointer group"
                  >
                    {copied ? (
                      <>
                        <span className="text-green-500">✅</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          Copiar texto
                        </span>
                      </>
                    )}
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">
                      {text.length} caracteres
                    </span>
                  </button>
                </div>

                {/* Pastebin / Share */}
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">
                    Compartilhar (Pastebin)
                  </p>
                  <div className="space-y-2">
                    {!shareLink ? (
                      <button
                        type="button"
                        onClick={generateShareLink}
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
                          <input
                            type="text"
                            readOnly
                            value={shareLink}
                            className="flex-1 bg-transparent text-xs text-gray-600 dark:text-gray-400 font-mono px-2 py-1 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={copyShareLink}
                            className="px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-medium hover:bg-violet-200 dark:hover:bg-violet-950/70 transition-colors cursor-pointer"
                          >
                            {shareCopied ? '✅' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center">
                          O texto fica codificado no link · ninguém mais vê
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── DETECT TAB ──────────────────────────────── */}
        {activeTab === 'detect' && (
          <div>
            {!text.trim() ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-sm">Cole um texto para detectar padrões</p>
              </div>
            ) : detections.length === 0 ? (
              <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                <span className="text-2xl block mb-2">✅</span>
                <p className="text-sm">Nenhum padrão detectado</p>
                <p className="text-[10px] text-gray-400 mt-1">URLs, emails, telefones ou código</p>
              </div>
            ) : (
              <div className="space-y-3">
                {detections.map((det) => (
                  <div
                    key={det.type}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{det.icon}</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {det.type}
                      </span>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 ml-auto">
                        {det.items.length} encontrado{det.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {det.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                          {item.startsWith('http') ? (
                            <a
                              href={item}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline truncate font-mono"
                            >
                              {item}
                            </a>
                          ) : (
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate font-mono">
                              {item}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(item)}
                            className="ml-auto text-[9px] text-gray-400 hover:text-violet-500 transition-colors flex-shrink-0 cursor-pointer"
                            title="Copiar"
                          >
                            📋
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TEMPLATES TAB ───────────────────────────── */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {/* Save current text as template */}
            {text.trim() && (
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">
                  Salvar texto atual como modelo
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Nome do modelo..."
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && saveAsTemplate()}
                  />
                  <button
                    type="button"
                    onClick={saveAsTemplate}
                    disabled={!templateName.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {/* Template list */}
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">
                {templates.length > 0 ? `${templates.length} modelo${templates.length !== 1 ? 's' : ''} salvo${templates.length !== 1 ? 's' : ''}` : 'Nenhum modelo salvo'}
              </p>
              {templates.length === 0 ? (
                <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                  <span className="text-3xl block mb-2">📋</span>
                  <p className="text-sm">Digite um texto e salve como modelo</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-200 group cursor-pointer"
                      onClick={() => loadTemplate(tpl)}
                    >
                      <span className="text-base">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {tpl.name}
                        </p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500">
                          {tpl.content.length} caracteres · {new Date(tpl.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm(`Excluir modelo "${tpl.name}"?`)) { // eslint-disable-line no-alert
                            deleteTemplate(tpl.id)
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
                        title="Excluir modelo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toast */}
            {showSavedToast && (
              <div className="fixed bottom-24 right-4 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium shadow-lg animate-fade-in z-50">
                {showSavedToast}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
