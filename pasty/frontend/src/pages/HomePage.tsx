import { useEffect, useCallback, useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User, Clip, Destination } from '../types'
import { getGoogleAuthUrl, saveText, getStoredToken } from '../api'
import { useSaveForm } from '../hooks/useSaveForm'
import { Header } from '../components/Header'
import { SEO } from '../components/SEO'
import { HistorySkeleton } from '../components/Skeleton'
import { LogoutDialog } from '../components/AuthGuard'
import { useToastActions } from '../components/Toast'
import { Footer } from '../components/Footer'
import { QRCode } from '../components/QRCode'
import {
  TextTools,
  ALL_TOOLS,
  loadToolsPref,
  saveToolsPref,
  type ToolKey,
} from '../components/TextTools'

// Lazy import components that are not needed immediately
const TextBox = lazy(() =>
  import('../components/TextBox').then((m) => ({ default: m.TextBox })),
)
const DestinationSelector = lazy(() =>
  import('../components/DestinationSelector').then((m) => ({
    default: m.DestinationSelector,
  })),
)
const SaveButton = lazy(() =>
  import('../components/SaveButton').then((m) => ({ default: m.SaveButton })),
)
const SuccessMessage = lazy(() =>
  import('../components/SuccessMessage').then((m) => ({
    default: m.SuccessMessage,
  })),
)
const History = lazy(() =>
  import('../components/History').then((m) => ({ default: m.History })),
)

// ─── Pending save ───────────────────────────────────────────

const PENDING_KEY = 'pasty_pending'

interface PendingSave {
  title: string
  text: string
  destination: Destination
}

interface PendingResult {
  clip?: Clip
  duplicate?: boolean
  error?: string
}

// ─── Component ──────────────────────────────────────────────

interface HomePageProps {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  onCallback: (code: string, state?: string) => Promise<User>
  onLogout: () => void
}

export function HomePage({ isAuthenticated, user, token, onCallback, onLogout }: HomePageProps) {
  const navigate = useNavigate()
  const toast = useToastActions()
  const [historyKey, setHistoryKey] = useState(0)
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(null)
  // Formulário aberto por padrão — usuário cola o texto assim que abre o site
  const [showForm, setShowForm] = useState(true)
  // Painel de ferramentas no mobile (independente do formulário)
  const [toolsOpen, setToolsOpen] = useState(false)
  // Ferramentas que o usuário escolhe exibir (persistido em localStorage)
  const [toolsEnabled, setToolsEnabled] = useState<ToolKey[]>(loadToolsPref)
  const [toolsSettingsOpen, setToolsSettingsOpen] = useState(false)
  // Autofoco apenas em desktop (pointer fino e tela ≥ 768px) — no mobile evita abrir o teclado automaticamente
  const [shouldAutoFocus] = useState(
    () =>
      typeof window !== 'undefined' &&
      !window.matchMedia('(pointer: coarse)').matches &&
      window.matchMedia('(min-width: 768px)').matches,
  )
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  const {
    title, text, destination, saving, savedClip, isDuplicate, saveError, canSave,
    setTitle, setText, setDestination, handleSave, dismissMessage,
  } = useSaveForm(token, () => setHistoryKey((k) => k + 1))

  // ─── OAuth callback ─────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')

    if (error) {
      console.error('OAuth error:', error)
      window.history.replaceState({}, '', '/')
      toast.error('Autenticação falhou', 'Não foi possível fazer login com o Google. Tente novamente.')
      return
    }

    if (code) {
      setAuthLoading(true)
      window.history.replaceState({}, '', '/')

      onCallback(code, state ?? undefined)
        .then(async () => {
          toast.success('Login realizado!', 'Bem-vindo ao Pasty.')

          const raw = sessionStorage.getItem(PENDING_KEY)
          if (!raw) return

          sessionStorage.removeItem(PENDING_KEY)
          const pending: PendingSave = JSON.parse(raw)
          if (!pending.text?.trim()) return

          const savedToken = getStoredToken()
          if (!savedToken) return

          try {
            const res = await saveText(
              pending.text.trim(),
              pending.destination,
              pending.title.trim() || 'Sem título',
              savedToken,
            )
            setPendingResult({ clip: res.clip, duplicate: res.duplicate })
            if (!res.duplicate) {
              toast.success('Texto salvo!', 'Seu texto pendente foi salvo com sucesso.')
            } else {
              toast.info('Texto já existe', 'Este texto já foi salvo anteriormente.')
            }
          } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } }; message?: string }
            setPendingResult({
              error: axiosError?.response?.data?.error ?? (err instanceof Error ? err.message : 'Erro ao salvar texto pendente'),
            })
            toast.error('Erro ao salvar', 'Não foi possível salvar o texto pendente.')
          }
        })
        .catch(() => {
          toast.error('Erro na autenticação', 'Falha ao processar o login.')
        })
        .finally(() => setAuthLoading(false))
    }
  }, [onCallback, toast])

  // ─── Detect pastebin shared link on mount ──────────────────

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#share=')) {
      try {
        const encoded = hash.replace('#share=', '')
        const decoded = decodeURIComponent(atob(encoded))
        if (decoded && decoded !== text) {
          setText(decoded)
          window.location.hash = ''
        }
      } catch {
        // Invalid share link
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ───────────────────────────────────────────────

  const toggleTool = useCallback((key: ToolKey) => {
    setToolsEnabled((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
      saveToolsPref(next)
      return next
    })
  }, [])

  const handleLogin = useCallback(async () => {
    try {
      const authUrl = await getGoogleAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      console.error('Failed to get auth URL:', err)
      toast.error('Erro ao conectar', 'Não foi possível iniciar o login com o Google.')
    }
  }, [toast])

  const handleSaveClick = useCallback(() => {
    if (!isAuthenticated) {
      const pending: PendingSave = { title, text, destination }
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
      handleLogin()
      return
    }
    handleSave()
  }, [isAuthenticated, title, text, destination, handleLogin, handleSave])

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true)
  }, [])

  const confirmLogout = useCallback(() => {
    setLoggingOut(true)
    setTimeout(() => {
      onLogout()
      setShowLogoutConfirm(false)
      setLoggingOut(false)
      navigate('/', { replace: true })
      toast.info('Até logo!', 'Você saiu da sua conta.')
    }, 300)
  }, [onLogout, navigate, toast])

  const dismissAll = useCallback(() => {
    setPendingResult(null)
    dismissMessage()
  }, [dismissMessage])

  // ─── Render ─────────────────────────────────────────────────

  const showSuccess = savedClip || pendingResult?.clip
  const showError = saveError || pendingResult?.error
  const showDuplicate = isDuplicate || pendingResult?.duplicate

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Pasty — Cole, salve e acesse de qualquer lugar"
        description="Cole qualquer texto no navegador e salve instantaneamente no Google Docs, Google Drive ou Gmail. Rápido, seguro e 100% grátis."
        canonical="https://pasty.ordob.com/"
      />

      <Header
        user={isAuthenticated ? user : null}
        onLogout={handleLogoutClick}
        onLogin={handleLogin}
        authLoading={authLoading}
      />

      <main id="main-content" className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {/* ─── Auth loading overlay ──────────────────────────── */}
        {authLoading && (
          <div className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center" role="status" aria-label="Autenticando">
            <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800">
              <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Autenticando...</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Conectando com Google</p>
            </div>
          </div>
        )}

        {/* ─── Grid Layout: floating tools on both sides, main centered ──── */}
        <div className="lg:grid lg:grid-cols-[1fr_minmax(0,2fr)_1fr] lg:gap-6 lg:items-start">
          {/* ─── Left Column: floating tools (3) ─────────── */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-4" aria-label="Ferramentas à esquerda">
            <TextTools
              side="left"
              enabled={toolsEnabled}
              text={text}
              title={title}
              onTextChange={setText}
              onTitleChange={setTitle}
            />
          </aside>

          {/* ─── Center Column: Hero + Form ──────────────── */}
          <div className="space-y-6 min-w-0">

            {/* ─── Hero branding ──────────────────────────────── */}
            <div className="text-center animate-fade-in">
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-xs font-medium border border-violet-200 dark:border-violet-800">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" aria-hidden="true" />
                Grátis — conexão inteligente com Google
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-[1.05] tracking-tight">
                Cole, salve e{' '}
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  acesse de qualquer lugar
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                Cole qualquer texto no navegador e salve instantaneamente no Google Docs, Google Drive ou Gmail.
                Rápido, seguro e 100% grátis.
              </p>
              <button
                onClick={() => setShowForm(!showForm)}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer"
                aria-expanded={showForm}
                aria-controls="save-form"
              >
                {showForm ? 'Fechar formulário' : 'Começar a usar'}
                <svg className={`w-4 h-4 transition-transform duration-300 ${showForm ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* ─── Formulario principal (aberto por padrão) ──── */}
            <div
              id="save-form"
              className={`space-y-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-500 ease-in-out ${
                showForm
                  ? 'opacity-100 max-h-[2000px] translate-y-0'
                  : 'opacity-0 max-h-0 translate-y-4 overflow-hidden p-0 border-0'
              }`}
              aria-hidden={!showForm}
            >
          {showForm && (
            <Suspense fallback={<div className="h-12 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />}>
              <div>
                <label htmlFor="paste-title" className="sr-only">Título</label>
                <input
                  id="paste-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-300 text-base shadow-sm"
                />
              </div>
              <TextBox text={text} onTextChange={setText} autoFocus={shouldAutoFocus} />

              {/* Destinos — cards distribuídos, sem cobrir o botão principal */}
              <DestinationSelector selected={destination} onChange={setDestination} />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {text && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block tabular-nums">
                    Ctrl+Enter para salvar
                  </span>
                )}
                <SaveButton
                  onClick={handleSaveClick}
                  loading={saving}
                  disabled={!canSave}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              {/* Auto-save status */}
              {text && !savedClip && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right tabular-nums">
                  Rascunho salvo automaticamente
                </p>
              )}

              {/* QR Code Section */}
              {text?.trim() && (
                <div className="flex justify-center pt-2">
                  <details className="group w-full">
                    <summary className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-200 cursor-pointer list-none">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span className="group-open:hidden">Gerar QR Code</span>
                      <span className="hidden group-open:inline">Ocultar QR Code</span>
                      <svg className={`w-3 h-3 transition-transform duration-200 group-open:rotate-180`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="pt-3">
                      <QRCode text={text} title={title} />
                    </div>
                  </details>
                </div>
              )}
            </Suspense>
          )}
        </div>

            {/* ─── Success/Error messages ─────────────────────── */}
            {(showSuccess || showError) && (
              <Suspense fallback={null}>
                <SuccessMessage
                  clip={savedClip ?? pendingResult?.clip ?? null}
                  duplicate={!!showDuplicate}
                  error={saveError ?? pendingResult?.error ?? null}
                  onDismiss={dismissAll}
                />
              </Suspense>
            )}

            {/* ─── Histórico ──────────────────────────────────── */}
            {isAuthenticated && user && token && (
              <div className="animate-slide-up">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  📋 Histórico
                </h2>
                <Suspense fallback={<HistorySkeleton />}>
                  <History token={token} refreshKey={historyKey} />
                </Suspense>
              </div>
            )}
          </div>

          {/* ─── Right Column: floating tools (2) ────────── */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-4" aria-label="Ferramentas à direita">
            <TextTools
              side="right"
              enabled={toolsEnabled}
              text={text}
              title={title}
              onTextChange={setText}
              onTitleChange={setTitle}
            />
          </aside>
        </div>

        {/* ─── Mobile tools panel (collapsible) ──────────── */}
        <div className="lg:hidden mt-8">
          <button
            type="button"
            onClick={() => setToolsOpen(!toolsOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer mb-3"
            aria-expanded={toolsOpen}
            aria-controls="tools-panel-mobile"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            {toolsOpen ? 'Fechar ferramentas' : 'Ferramentas'}
          </button>

          <div
            id="tools-panel-mobile"
            className={`transition-all duration-500 ease-in-out ${
              toolsOpen
                ? 'opacity-100 max-h-[2000px] translate-y-0'
                : 'opacity-0 max-h-0 overflow-hidden translate-y-4'
            }`}
          >
            <div className="space-y-4 animate-slide-up">
              <TextTools
                side="left"
                enabled={toolsEnabled}
                text={text}
                title={title}
                onTextChange={setText}
                onTitleChange={setTitle}
              />
              <TextTools
                side="right"
                enabled={toolsEnabled}
                text={text}
                title={title}
                onTextChange={setText}
                onTitleChange={setTitle}
              />
            </div>
          </div>
        </div>

        {/* ─── Floating tools settings (choose which to show) ── */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setToolsSettingsOpen((o) => !o)}
            aria-label="Configurar ferramentas"
            aria-expanded={toolsSettingsOpen}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-violet-600/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span className="hidden sm:inline">Ferramentas</span>
          </button>

          {toolsSettingsOpen && (
            <div className="absolute bottom-16 right-0 w-72 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-scale-in z-50">
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Ferramentas ativas</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">{toolsEnabled.length}/{ALL_TOOLS.length}</span>
              </div>
              <div className="p-2">
                {ALL_TOOLS.map((tool) => {
                  const checked = toolsEnabled.includes(tool.key)
                  return (
                    <label
                      key={tool.key}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTool(tool.key)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500 cursor-pointer"
                        aria-label={`Ativar ${tool.label}`}
                      />
                      <span className="text-sm">{tool.icon}</span>
                      <span className={`text-sm flex-1 ${checked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
                        {tool.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Empty state for unauthenticated users ───── */}
      {!isAuthenticated && !showForm && (
        <div className="text-center py-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Comece agora
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Clique em "Começar a usar" acima para colar seu primeiro texto e escolher onde salvar.
          </p>
        </div>
      )}

      {/* ─── Logout confirmation dialog ─────────────────── */}
      <LogoutDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        loading={loggingOut}
      />

      <Footer />
    </div>
  )
}
