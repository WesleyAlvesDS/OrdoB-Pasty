import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User, DestinationInfo, Clip } from '../types'
import { getGoogleAuthUrl, saveText } from '../api'
import { useSaveForm } from '../hooks/useSaveForm'
import { Header } from '../components/Header'
import { TextBox } from '../components/TextBox'
import { DestinationSelector } from '../components/DestinationSelector'
import { SaveButton } from '../components/SaveButton'
import { SuccessMessage } from '../components/SuccessMessage'
import { History } from '../components/History'
import { Footer } from '../components/Footer'

// ─── Pending save (survives OAuth redirect) ────────────────────

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

// ─── Component ─────────────────────────────────────────────────

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
          // ✅ Logou! Verifica se tem texto pendente para salvar
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
            const pendingError = axiosError?.response?.data?.error
            setPendingResult({
              error: pendingError ?? (err instanceof Error ? err.message : 'Erro ao salvar texto pendente'),
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
      // Salva intent no sessionStorage antes de redirecionar
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
      <Header user={isAuthenticated ? user : null} onLogout={handleLogout} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ─── Hero branding ──────────────────────────────── */}
        <div className="text-center animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-xs font-medium border border-violet-200 dark:border-violet-800">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
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
        </div>

        {/* ─── Destinations preview ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
            >
              <span className="text-2xl">{dest.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{dest.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{dest.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Success/Error messages ─────────────────────── */}
        {(showSuccess || showError) && (
          <SuccessMessage
            clip={savedClip ?? pendingResult?.clip ?? null}
            duplicate={!!showDuplicate}
            error={saveError ?? pendingResult?.error ?? null}
            onDismiss={dismissAll}
          />
        )}

        {/* ─── Formulario principal (SEMPRE visivel) ──────── */}
        <div className="space-y-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo (opcional)"
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
        </div>

        {/* ─── Historico (so se logado) ──────────────────── */}
        {isAuthenticated && user && token && (
          <div className="animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📋 Historico
            </h2>
            <History token={token} refreshKey={historyKey} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
