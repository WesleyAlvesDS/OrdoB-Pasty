import { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { ToastProvider } from './components/Toast'
import { SessionStatus } from './components/AuthGuard'
import { PageHeroSkeleton } from './components/Skeleton'
import { SEO, orgJsonLd } from './components/SEO'
import { clearStoredAuth } from './api'

// ─── Lazy loaded pages ──────────────────────────────────────

const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const SendTextToPc = lazy(() =>
  import('./pages/SendTextToPc').then((m) => ({ default: m.SendTextToPc })),
)
const SaveTextOnline = lazy(() =>
  import('./pages/SaveTextOnline').then((m) => ({ default: m.SaveTextOnline })),
)
const PrivacyPolicy = lazy(() =>
  import('./pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })),
)
const TermsOfService = lazy(() =>
  import('./pages/TermsOfService').then((m) => ({ default: m.TermsOfService })),
)
const Guia = lazy(() =>
  import('./pages/Guia').then((m) => ({ default: m.Guia })),
)
const ColarTextoOnline = lazy(() =>
  import('./pages/ColarTextoOnline').then((m) => ({ default: m.ColarTextoOnline })),
)
const BookmarkletPage = lazy(() =>
  import('./pages/BookmarkletPage').then((m) => ({ default: m.BookmarkletPage })),
)

// ─── Loading fallback ───────────────────────────────────────

function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80" style={{ height: '64px' }} />
      <PageHeroSkeleton />
    </div>
  )
}

// ─── Auth expired listener ──────────────────────────────────

function AuthExpiredListener({ onExpired }: { onExpired: () => void }) {
  useEffect(() => {
    const handler = () => onExpired()
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [onExpired])
  return null
}

// ─── App ────────────────────────────────────────────────────

function App() {
  const { user, token, loading, isAuthenticated, handleCallback, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <SEO
          title="Pasty — Cole, salve e acesse de qualquer lugar"
          description="Cole qualquer texto no navegador e salve instantaneamente no Google Docs, Google Drive ou Gmail. Rápido, seguro e 100% grátis."
          canonical="https://pasty.ordob.com/"
          jsonLd={orgJsonLd}
        />
        <ScrollToTop />
        <GoogleAnalytics />
        <SessionStatus
          token={token}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        <AuthExpiredListener onExpired={clearStoredAuth} />

        <Routes>
          {/* Home = app principal (público + autenticado) */}
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoading />}>
                <HomePage
                  isAuthenticated={isAuthenticated}
                  user={user}
                  token={token}
                  onCallback={handleCallback}
                  onLogout={handleLogout}
                />
              </Suspense>
            }
          />

          {/* Callback OAuth */}
          <Route
            path="/auth/callback"
            element={
              <Suspense fallback={<PageLoading />}>
                <HomePage
                  isAuthenticated={isAuthenticated}
                  user={user}
                  token={token}
                  onCallback={handleCallback}
                  onLogout={handleLogout}
                />
              </Suspense>
            }
          />

          {/* Landing pages SEO */}
          <Route
            path="/send-text-to-pc"
            element={
              <Suspense fallback={<PageLoading />}>
                <SendTextToPc />
              </Suspense>
            }
          />
          <Route
            path="/save-text-online"
            element={
              <Suspense fallback={<PageLoading />}>
                <SaveTextOnline />
              </Suspense>
            }
          />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={<PageLoading />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />
          <Route
            path="/terms"
            element={
              <Suspense fallback={<PageLoading />}>
                <TermsOfService />
              </Suspense>
            }
          />
          <Route
            path="/guia"
            element={
              <Suspense fallback={<PageLoading />}>
                <Guia />
              </Suspense>
            }
          />
          <Route
            path="/colar-texto-online"
            element={
              <Suspense fallback={<PageLoading />}>
                <ColarTextoOnline />
              </Suspense>
            }
          />
          <Route
            path="/bookmarklet"
            element={
              <Suspense fallback={<PageLoading />}>
                <BookmarkletPage />
              </Suspense>
            }
          />

          {/* /app redireciona para / */}
          <Route path="/app" element={<Navigate to="/" replace />} />

          {/* 404 → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
