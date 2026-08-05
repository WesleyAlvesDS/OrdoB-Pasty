import { useState, useCallback, useEffect } from 'react'
import { Tooltip } from './Tooltip'

interface Template {
  id: string
  name: string
  content: string
  createdAt: number
}

interface TextTemplatesProps {
  text: string
  onTextChange: (text: string) => void
  onTitleChange: (title: string) => void
}

const STORAGE_KEY = 'pasty_templates'

function loadTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveTemplates(templates: Template[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(templates)) } catch { /* full */ }
}

export function TextTemplates({ text, onTextChange, onTitleChange }: TextTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>(loadTemplates)
  const [templateName, setTemplateName] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { saveTemplates(templates) }, [templates])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const saveAsTemplate = useCallback(() => {
    if (!text.trim() || !templateName.trim()) return
    const name = templateName.trim()
    // Check for duplicate
    if (templates.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      showToast('Já existe um modelo com esse nome!')
      return
    }
    const newTemplate: Template = { id: Date.now().toString(), name, content: text, createdAt: Date.now() }
    setTemplates((prev) => [newTemplate, ...prev])
    setTemplateName('')
    showToast('Modelo salvo! ✅')
  }, [text, templateName, templates, showToast])

  const loadTemplate = useCallback((tpl: Template) => {
    onTextChange(tpl.content)
    onTitleChange(tpl.name)
    showToast(`Modelo "${tpl.name}" carregado`)
  }, [onTextChange, onTitleChange, showToast])

  const deleteTemplate = useCallback((tpl: Template) => {
    if (window.confirm(`Excluir modelo "${tpl.name}"?`)) { // eslint-disable-line no-alert
      setTemplates((prev) => prev.filter((t) => t.id !== tpl.id))
      showToast(`"${tpl.name}" excluído`)
    }
  }, [showToast])

  return (
    <div className="space-y-4">
      {/* Save form */}
      {text.trim() && (
        <div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">Salvar texto atual como modelo</p>
          <div className="flex items-center gap-2">
            <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Nome do modelo..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-400 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && saveAsTemplate()}
            />
            <button type="button" onClick={saveAsTemplate} disabled={!templateName.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer">
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Template list */}
      <div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">
          {templates.length > 0
            ? `${templates.length} modelo${templates.length !== 1 ? 's' : ''} salvo${templates.length !== 1 ? 's' : ''}`
            : 'Nenhum modelo salvo'}
        </p>
        {templates.length === 0 ? (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
            <span className="text-3xl block mb-2">📋</span>
            <p className="text-sm">Digite um texto e salve como modelo</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {templates.map((tpl) => (
              <Tooltip key={tpl.id} label={`Carregar "${tpl.name}"`}>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-200 group cursor-pointer"
                  onClick={() => loadTemplate(tpl)}
                >
                  <span className="text-base">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{tpl.name}</p>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500">{tpl.content.length} caracteres · {new Date(tpl.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl) }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer" title="Excluir modelo">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 right-4 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium shadow-lg animate-fade-in z-50">{toast}</div>
      )}
    </div>
  )
}
