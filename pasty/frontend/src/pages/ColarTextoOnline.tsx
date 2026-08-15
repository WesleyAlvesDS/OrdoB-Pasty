import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SEO, breadcrumbJsonLd, faqJsonLd } from '../components/SEO'
import { Footer } from '../components/Footer'
import { AdBanner } from '../components/AdBanner'

const faqs = [
  {
    q: 'O que é colar texto online?',
    a: 'É a ação de copiar um texto e salvá-lo na internet para acessá-lo depois de qualquer dispositivo. Com o Pasty, você cola o texto no site e ele é enviado direto para seu Google Docs, Drive ou Gmail.',
  },
  {
    q: 'Posso colar textos longos?',
    a: 'Sim. O Pasty aceita textos grandes sem problema. Cole, dê um título e salve no destino de sua escolha.',
  },
  {
    q: 'Meus textos colados são públicos?',
    a: 'Não. Seus textos são salvos apenas na sua conta Google (Docs, Drive ou Gmail). O Pasty não armazena nem publica seu conteúdo.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Sim. Basta abrir pasty.ordob.com no navegador do celular, colar o texto e salvar. Funciona em qualquer dispositivo.',
  },
]

const pageJsonLd = breadcrumbJsonLd([
  { name: 'Início', url: 'https://pasty.ordob.com/' },
  { name: 'Colar texto online', url: 'https://pasty.ordob.com/colar-texto-online' },
])

export function ColarTextoOnline() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Colar texto online grátis | Pasty"
        description="Cole texto online e salve em segundos no Google Docs, Drive ou Gmail. Sem cadastro complicado, sem instalar nada. Acesse de qualquer dispositivo. Grátis."
        canonical="https://pasty.ordob.com/colar-texto-online"
        ogType="website"
        jsonLd={{ ...pageJsonLd, ...faqJsonLd(faqs) }}
      />

      <Header user={null} />

      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        {/* ─── Hero ─────────────────────────────────────── */}
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Colar texto online grátis
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Precisa colar e guardar um texto rapidamente? O Pasty envia direto para o seu Google Docs,
            Drive ou Gmail — sem perda, sem cadastro complicado, sem instalar nada.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
            >
              Colar texto agora — é grátis
            </Link>
          </div>
        </section>

        {/* ─── Benefícios ───────────────────────────────── */}
        <section className="mb-16" aria-labelledby="benefits-title">
          <h2 id="benefits-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Por que colar texto no Pasty?
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '⚡', title: 'Rápido', desc: 'Cole e salve em segundos, sem etapas extras.' },
              { icon: '🔒', title: 'Privado', desc: 'Seu texto vai direto para sua conta Google. Ninguém mais vê.' },
              { icon: '📱', title: 'Qualquer dispositivo', desc: 'Celular, tablet ou PC. Acesse de onde estiver.' },
              { icon: '💰', title: '100% grátis', desc: 'Sem cartão de crédito, sem trial, sem pegadinhas.' },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Como funciona ────────────────────────────── */}
        <section className="mb-16" aria-labelledby="how-title">
          <h2 id="how-title" className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Como funciona
          </h2>
          <ol className="space-y-4">
            {[
              'Acesse pasty.ordob.com no seu navegador',
              'Clique em "Entrar com Google"',
              'Cole o texto que deseja salvar',
              'Escolha Google Docs, Drive ou Gmail',
              'Clique em Salvar — pronto!',
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

        {/* ─── FAQ ──────────────────────────────────────── */}
        <section className="mb-16" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <svg
                    className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
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
