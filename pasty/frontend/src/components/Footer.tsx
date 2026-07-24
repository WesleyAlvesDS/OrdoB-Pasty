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
  supporters: [
    {
      name: 'Seu SaaS',
      desc: 'Em breve...',
      href: '#',
      initial: 'S',
    },
    {
      name: 'Seu Blog',
      desc: 'Em breve...',
      href: '#',
      initial: 'B',
    },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50">
      <div className="max-w-5xl mx-auto px-4">
        {/* ─── Grid principal ──────────────────────────── */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-3">
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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                <li key={item.name} className="group">
                  <Link
                    to={item.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5"
                  >
                    <span className="w-0.5 h-0.5 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <li key={item.name} className="group">
                  <Link
                    to={item.href}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conecte-se + Apoiadores */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 tracking-wide uppercase">
              Conecte-se
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">
                <span className="text-base">✉️</span>
                contato@pasty.app
              </li>
            </ul>

            {/* ─── Apoiadores (discreto) ────────────────── */}
            <h4 className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-6 mb-3">
              Apoiadores
            </h4>
            <ul className="space-y-2">
              {navigation.supporters.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-sm text-gray-400 dark:text-gray-500 hover:text-violet-500 dark:hover:text-violet-400 transition-all duration-200"
                  >
                    <span className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500/30 to-purple-600/30 dark:from-violet-500/20 dark:to-purple-600/20 flex items-center justify-center text-[10px] font-bold text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform duration-200">
                      {item.initial}
                    </span>
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {item.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Barra inferior ──────────────────────────── */}
        <div className="py-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()} Pasty. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Feito com <span className="text-red-400">♥</span> para simplificar seu dia
          </p>
        </div>
      </div>
    </footer>
  )
}
