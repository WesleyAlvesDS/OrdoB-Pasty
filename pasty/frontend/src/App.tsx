import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { HomePage } from './pages/HomePage'
import { SendTextToPc } from './pages/SendTextToPc'
import { SaveTextOnline } from './pages/SaveTextOnline'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { TermsOfService } from './pages/TermsOfService'

function App() {
  const { user, token, loading, isAuthenticated, handleCallback, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <GoogleAnalytics />

      <Routes>
        {/* Home = app principal (público + autenticado) */}
        <Route
          path="/"
          element={
            <HomePage
              isAuthenticated={isAuthenticated}
              user={user}
              token={token}
              onCallback={handleCallback}
              onLogout={logout}
            />
          }
        />

        {/* Callback OAuth — rota explícita para preservar ?code= na URL */}
        <Route
          path="/auth/callback"
          element={
            <HomePage
              isAuthenticated={isAuthenticated}
              user={user}
              token={token}
              onCallback={handleCallback}
              onLogout={logout}
            />
          }
        />

        {/* Landing pages SEO */}
        <Route path="/send-text-to-pc" element={<SendTextToPc />} />
        <Route path="/save-text-online" element={<SaveTextOnline />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* /app redireciona para / */}
        <Route path="/app" element={<Navigate to="/" replace />} />

        {/* Qualquer outra rota → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
