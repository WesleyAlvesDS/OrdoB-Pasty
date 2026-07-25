import { Link } from 'react-router-dom'

const navigation = {
  pages: [
    { name: 'Início', href: '/' },
    { name: 'Enviar texto para o PC', href: '/send-text-to-pc' },
    { name: 'Salvar texto online', href: '/save-text-online' },
  ],
  legal: [
    { name: 'Política de Privacidade', href: '/privacy' },
    { name: 'Termos de Uso', href: '/terms' },
  ],
}

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50" role="contentinfo">
      <div className="max-w-5xl mx-auto px-4">
        {/* ─── Grid principal ──────────────────────────── */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-3" aria-label="Pasty - Página inicial">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-lg group-hover:shadow-violet-300/40 dark:group-hover:shadow-violet-950/50 transition-all duration-300 group-hover:scale-110">
                P
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-lg tracking-tight">
                Pasty
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Cole qualquer texto e salve diretamente no Google Docs, Google Drive ou Gmail.
              Acesse de qualquer dispositivo.
            </p>
            {/* Badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              MVP — Grátis
            </div>
          </div>

          {/* Páginas */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 tracking-wide uppercase">
              Páginas
            </h3>
            <ul className="space-y-3">
              {navigation.pages.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-0.5 h-0.5 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 tracking-wide uppercase">
              Legal
            </h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-all duration-300" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* OrdoB / Contato */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 tracking-wide uppercase">
              OrdoB
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://ordob.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 inline-flex items-center gap-2 group"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FE5416] flex-shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  <span className="group-hover:translate-x-0.5 transition-transform">OrdoB Matriz</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@pasty.app"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 inline-flex items-center gap-2 group"
                >
                  <span className="text-base" aria-hidden="true">✉️</span>
                  contato@pasty.app
                </a>
              </li>
              <li>
                <a
                  href="https://ordob.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 inline-flex items-center gap-2 group"
                >
                  <span className="text-base" aria-hidden="true">🏢</span>
                  OrdoB Tecnologia
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Matrix Badge */}
        <div className="flex justify-center pb-6">
          <a
            href="https://ordob.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-300 hover:shadow-md group"
          >
            <div className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FE5416]">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                OrdoB
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 group-hover:text-violet-500 transition-colors">
              Pasty
            </span>
            <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* ─── Barra inferior ──────────────────────────── */}
        <div className="py-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            &copy; {currentYear} Pasty. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Feito com <span className="text-red-400" aria-label="amor">♥</span> no{' '}
            <a href="https://ordob.com" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-400 transition-colors">
              núcleo OrdoB
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
