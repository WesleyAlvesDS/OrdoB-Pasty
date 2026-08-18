import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '../types'
import { Avatar } from './Avatar'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  user: User | null
  onLogout?: () => void
  onLogin?: () => void
  authLoading?: boolean
}

const navLinks = [
  { name: 'Início', href: '/' },
  { name: 'Enviar para o PC', href: '/send-text-to-pc' },
  { name: 'Salvar texto', href: '/save-text-online' },
  { name: 'Guia', href: '/guia' },
]

export function Header({ user, onLogout, onLogin, authLoading }: HeaderProps) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const isLandingPage = ['/send-text-to-pc', '/save-text-online', '/privacy', '/terms'].includes(location.pathname)

  const handleLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      onLogout?.()
    }, 300)
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <a href="#main-content" className="skip-to-content focus:top-0">
        Ir para o conteúdo principal
      </a>

      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* ─── Logo + OrdoB ──────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="Pasty - Página inicial">
            <div
              className="w-8 h-8 rounded-lg shadow-sm group-hover:shadow-lg group-hover:shadow-violet-300/40 dark:group-hover:shadow-violet-950/50 transition-all duration-300 group-hover:scale-110"
              style={{ backgroundImage: 'url(/logo.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
              aria-hidden="true"
            />
            <span className="font-semibold text-gray-900 dark:text-white text-lg tracking-tight">
              Pasty
            </span>
          </Link>

          {/* OrdoB Matriz Link */}
          <a
            href="https://ordob.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 hover:text-[#FE5416] hover:border-[#FE5416]/30 transition-all duration-200"
          >
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FE5416]">
              <span className="h-1 w-1 rounded-full bg-white" />
            </span>
            OrdoB™
          </a>
        </div>

        {/* ─── Nav (desktop) ────────────────────────────── */}
        {isLandingPage && (
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>
        )}

        {/* ─── Direita ──────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <ThemeToggle />

          {user ? (
            /* ─── Usuário autenticado ───────────────────── */
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar
                src={user.avatar_url}
                name={user.name}
                email={user.email}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block max-w-[120px] truncate">
                {user.name ?? user.email}
              </span>
              {onLogout && (
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`text-sm transition-all duration-300 px-3 py-1.5 rounded-lg hover:scale-105 active:scale-95 cursor-pointer ${
                    loggingOut
                      ? 'text-gray-300 dark:text-gray-600'
                      : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                  aria-label="Sair da conta"
                >
                  {loggingOut ? 'Saindo...' : 'Sair'}
                </button>
              )}
            </div>
          ) : (
            /* ─── Botão Entrar com Google ───────────────── */
            <button
              onClick={onLogin}
              disabled={authLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              aria-label="Entrar com Google"
            >
              {/* Google G logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {authLoading ? 'Entrando...' : 'Entrar com Google'}
            </button>
          )}

          {/* ─── Mobile menu button ─────────────────────── */}
          {isLandingPage && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ─── Mobile menu ────────────────────────────────── */}
      {isLandingPage && mobileOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slide-down overflow-y-auto max-h-[80vh]"
          aria-label="Navegação móvel"
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}

            {/* Login button mobile */}
            {!user && onLogin && (
              <button
                onClick={() => { onLogin(); setMobileOpen(false); }}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {authLoading ? 'Entrando...' : 'Entrar com Google'}
              </button>
            )}

            {/* OrdoB Link */}
            <a
              href="https://ordob.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#FE5416] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <span className="inline-flex items-center gap-2">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FE5416]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                OrdoB™ Matriz
              </span>
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
