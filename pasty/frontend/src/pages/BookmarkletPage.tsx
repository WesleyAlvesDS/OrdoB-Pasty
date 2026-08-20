import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SEO, breadcrumbJsonLd } from '../components/SEO'
import { Footer } from '../components/Footer'
import { AdBanner } from '../components/AdBanner'
import { buildBookmarklet } from '../utils/bookmarklet'

const pageJsonLd = breadcrumbJsonLd([
  { name: 'Início', url: 'https://pasty.ordob.com/' },
  { name: 'Bookmarklet', url: 'https://pasty.ordob.com/bookmarklet' },
])

export function BookmarkletPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const href = useMemo(() => buildBookmarklet(), [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Bookmarklet Pasty | Cole texto selecionado com 1 clique"
        description="Instale o bookmarklet do Pasty e cole qualquer texto selecionado na web diretamente no Google Docs, Drive ou Gmail (rascunho) com um clique."
        canonical="https://pasty.ordob.com/bookmarklet"
        ogType="website"
        jsonLd={pageJsonLd}
      />

      <Header user={null} />

      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Bookmarklet do Pasty
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Cole qualquer texto selecionado na web direto no Pasty com um clique.
            Sem extensão, sem instalar nada.
          </p>
        </section>

        {/* ─── Install ───────────────────────────────────── */}
        <section className="mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Arraste o botão abaixo para a barra de favoritos do seu navegador:
            </p>
            <a
              href={href}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              📌 Colar texto no Pasty
            </a>
          </div>
        </section>

        {/* ─── Como usar ─────────────────────────────────── */}
        <section className="mb-12" aria-labelledby="how-title">
          <h2 id="how-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Como usar
          </h2>
          <ol className="space-y-4">
            {[
              'Arraste o botão roxo acima para a barra de favoritos',
              'Selecione um texto em qualquer página da web',
              'Clique no favorito "Colar texto no Pasty"',
              'O Pasty abre com o texto já preenchido',
              'Escolha Google Docs, Drive ou Gmail (rascunho) e salve',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ─── Alternativa manual ────────────────────────── */}
        <section className="mb-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Alternativa manual
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Prefere copiar e colar o código manualmente? Crie um favorito e use este código como URL:
          </p>
          <code className="block text-[11px] text-violet-600 dark:text-violet-400 font-mono bg-gray-50 dark:bg-gray-950 rounded-xl p-3 break-all">
            {href}
          </code>
        </section>

        {/* ─── Related links ───────────────────────────── */}
        <section className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Páginas relacionadas:</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/send-text-to-pc" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
              Enviar texto do celular para o PC
            </Link>
            <Link to="/save-text-online" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
              Salvar texto online
            </Link>
            <Link to="/guia" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
              Guia de uso
            </Link>
          </div>
        </section>
      </main>

      <AdBanner />
      <Footer />
    </div>
  )
}