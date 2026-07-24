import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '../types'
import { Avatar } from './Avatar'

interface HeaderProps {
  user: User | null
  onLogout?: () => void
}

const navLinks = [
  { name: 'Início', href: '/' },
  { name: 'Enviar para o PC', href: '/send-text-to-pc' },
  { name: 'Salvar texto', href: '/save-text-online' },
]

export function Header({ user, onLogout }: HeaderProps) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isLandingPage = ['/send-text-to-pc', '/save-text-online', '/privacy'].includes(location.pathname)

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* ─── Logo ─────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-lg group-hover:shadow-violet-300/40 dark:group-hover:shadow-violet-950/50 transition-all duration-300 group-hover:scale-110">
            P
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-lg tracking-tight">
            Pasty
          </span>
        </Link>

        {/* ─── Nav (desktop) ────────────────────────────── */}
        {isLandingPage && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
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
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
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
                  onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Sair
                </button>
              )}
            </div>
          ) : (
            !isLandingPage && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Faça login para salvar
              </span>
            )
          )}

          {/* ─── Mobile menu button ─────────────────────── */}
          {isLandingPage && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
              aria-label="Abrir menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
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
          </div>
        </nav>
      )}
    </header>
  )
}
