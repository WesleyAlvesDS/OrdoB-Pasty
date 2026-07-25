import { useEffect, useCallback, useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User, DestinationInfo, Clip } from '../types'
import { getGoogleAuthUrl, saveText } from '../api'
import { useSaveForm } from '../hooks/useSaveForm'
import { Header } from '../components/Header'
import { SEO } from '../components/SEO'
import { HistorySkeleton } from '../components/Skeleton'
import { Footer } from '../components/Footer'

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
  destination: string
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
  const [historyKey, setHistoryKey] = useState(0)
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(null)
  const [showForm, setShowForm] = useState(false)

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
      return
    }

    if (code) {
      window.history.replaceState({}, '', '/')
      onCallback(code)
        .then(async () => {
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
          } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } }; message?: string }
            setPendingResult({
              error: axiosError?.response?.data?.error ?? (err instanceof Error ? err.message : 'Erro ao salvar texto pendente'),
            })
          }
        })
        .catch((err: Error) => {
          console.error('Auth callback failed:', err)
        })
    }
  }, [onCallback])

  // ─── Handlers ───────────────────────────────────────────────

  const handleLogin = useCallback(async () => {
    try {
      const authUrl = await getGoogleAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      console.error('Failed to get auth URL:', err)
    }
  }, [])

  const handleSaveClick = useCallback(() => {
    if (!isAuthenticated) {
      const pending: PendingSave = { title, text, destination }
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
      handleLogin()
      return
    }
    handleSave()
  }, [isAuthenticated, title, text, destination, handleLogin, handleSave])

  const handleLogout = useCallback(() => {
    onLogout()
    navigate('/', { replace: true })
  }, [onLogout, navigate])

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

      <Header user={isAuthenticated ? user : null} onLogout={handleLogout} />

      <main id="main-content" className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
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
                <DestinationSelector selected={destination} onChange={setDestination} />
                <SaveButton
                  onClick={handleSaveClick}
                  loading={saving}
                  disabled={!canSave}
                  isAuthenticated={isAuthenticated}
                />
              </div>
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

      <Footer />
    </div>
  )
}
