import { useEffect, useCallback, useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User, DestinationInfo, Clip, Destination } from '../types'
import { getGoogleAuthUrl, saveText } from '../api'
import { useSaveForm } from '../hooks/useSaveForm'
import { Header } from '../components/Header'
import { SEO } from '../components/SEO'
import { HistorySkeleton } from '../components/Skeleton'
import { LogoutDialog } from '../components/AuthGuard'
import { useToastActions } from '../components/Toast'
import { Footer } from '../components/Footer'
import { QRCode } from '../components/QRCode'

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

const destinations: DestinationInfo[] = [
  { id: 'docs', label: 'Google Docs', icon: '📄', description: 'Documento formatado', color: 'from-blue-500' },
  { id: 'drive', label: 'Google Drive', icon: '📁', description: 'Arquivo de texto na nuvem', color: 'from-amber-500' },
  { id: 'gmail', label: 'Gmail Draft', icon: '✉️', description: 'Rascunho de e-mail', color: 'from-red-500' },
]

// ─── Component ──────────────────────────────────────────────

interface HomePageProps {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  onCallback: (code: string) => Promise<User>
  onLogout: () => void
}

export function HomePage({ isAuthenticated, user, token, onCallback, onLogout }: HomePageProps) {
  const navigate = useNavigate()
  const toast = useToastActions()
  const [historyKey, setHistoryKey] = useState(0)
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [logingOut, setLogingOut] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  const {
    title, text, destination, saving, savedClip, isDuplicate, saveError, canSave,
    setTitle, setText, setDestination, handleSave, dismissMessage,
  } = useSaveForm(token, () => setHistoryKey((k) => k + 1))

  // ─── OAuth callback ─────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
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

      onCallback(code)
        .then(async () => {
          toast.success('Login realizado!', 'Bem-vindo ao Pasty.')

          const raw = sessionStorage.getItem(PENDING_KEY)
          if (!raw) return

          sessionStorage.removeItem(PENDING_KEY)
          const pending: PendingSave = JSON.parse(raw)
          if (!pending.text?.trim()) return

          const savedToken = localStorage.getItem('utc_token')
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

  // ─── Handlers ───────────────────────────────────────────────

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
    setLogingOut(true)
    setTimeout(() => {
      onLogout()
      setShowLogoutConfirm(false)
      setLogingOut(false)
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
      />

      <main id="main-content" className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
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
            {showForm ? 'Fechar' : 'Começar a usar'}
            <svg className={`w-4 h-4 transition-transform duration-300 ${showForm ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ─── Destinations preview ──────────────────────── */}
        <h2 className="sr-only">Destinos disponíveis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-300 hover:shadow-md"
            >
              <span className="text-2xl" aria-hidden="true">{dest.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{dest.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{dest.description}</p>
              </div>
            </div>
          ))}
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

        {/* ─── Formulario principal ──────────────────────── */}
        <div
          id="save-form"
          className={`space-y-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-500 ease-in-out ${
            showForm
              ? 'opacity-100 max-h-[800px] translate-y-0'
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
              <TextBox text={text} onTextChange={setText} />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <DestinationSelector selected={destination} onChange={setDestination} />
                  {text && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block tabular-nums">
                      Ctrl+Enter
                    </span>
                  )}
                </div>
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
        loading={logingOut}
      />

      <Footer />
    </div>
  )
}
