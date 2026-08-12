import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SEO, breadcrumbJsonLd } from '../components/SEO'
import { Footer } from '../components/Footer'
import { AdBanner } from '../components/AdBanner'

const steps = [
  {
    step: '01',
    title: 'Acesse o site',
    desc: 'Abra pasty.ordob.com no navegador do seu celular. Faça login com sua conta Google em segundos.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    step: '02',
    title: 'Cole o texto',
    desc: 'Copie o texto de qualquer aplicativo e cole no campo de texto. Dê um título ao documento.',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    step: '03',
    title: 'Escolha o destino',
    desc: 'Selecione Google Docs, Drive ou Gmail. Pronto — o texto estará no seu PC instantaneamente.',
    gradient: 'from-pink-500 to-rose-600',
  },
]

const benefits = [
  { icon: '⚡', title: 'Instantâneo', desc: 'Salve textos em segundos. Sem apps, sem cabos, sem complicação.' },
  { icon: '🔒', title: 'Seguro', desc: 'Seus dados trafegam com criptografia. Apenas você tem acesso.' },
  { icon: '🌐', title: 'Qualquer dispositivo', desc: 'Funciona no celular, tablet, PC — qualquer navegador moderno.' },
  { icon: '📁', title: 'Múltiplos destinos', desc: 'Google Docs, Drive e Gmail. Escolha onde quer salvar.' },
]

const pageJsonLd = breadcrumbJsonLd([
  { name: 'Início', url: 'https://pasty.ordob.com/' },
  { name: 'Enviar texto para o PC', url: 'https://pasty.ordob.com/send-text-to-pc' },
])

export function SendTextToPc() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Envie texto do celular para o PC"
        description="Cansado de se enviar e-mails ou WhatsApp para transferir texto do celular para o PC? Com o Pasty, cole e salve diretamente no Google Docs, Drive ou Gmail."
        canonical="https://pasty.ordob.com/send-text-to-pc"
        ogType="website"
        jsonLd={pageJsonLd}
      />

      <Header user={null} />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <div
              className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-xs font-medium border border-violet-200 dark:border-violet-800"
              style={{ animation: 'fade-in 0.5s ease-out both' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" aria-hidden="true" />
              Grátis — conexão inteligente com Google
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.05] tracking-tight"
              style={{ animation: 'fade-in 0.5s ease-out 0.1s both' }}
            >
              Envie texto do{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                celular para o PC
              </span>
            </h1>

            <p
              className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed"
              style={{ animation: 'fade-in 0.5s ease-out 0.2s both' }}
            >
              Cansado de se enviar e-mails ou mensagens no WhatsApp só para transferir um texto
              do celular para o computador? Com o Pasty, você cola e salva diretamente no Google.
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{ animation: 'fade-in 0.5s ease-out 0.3s both' }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
              >
                Começar agora
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <span className="text-sm text-gray-400">
                • Não precisa baixar nada
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Steps ────────────────────────────────────── */}
      <section className="relative max-w-4xl mx-auto px-4 pb-16" aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Como funciona em 3 passos
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-12 max-w-md mx-auto">
          Rápido, simples e direto — sem complicação
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map(({ step, title, desc, gradient }, index) => (
            <div
              key={step}
              className="group relative"
              style={{ animation: `fade-in 0.5s ease-out ${0.15 * (index + 1)}s both` }}
            >
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-8 left-[60%] w-[calc(80%)] h-0.5 bg-gradient-to-r from-violet-200 to-purple-200 dark:from-violet-800 dark:to-purple-800" aria-hidden="true" />
              )}

              <div className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-950/30 hover:-translate-y-1 hover:border-violet-200 dark:hover:border-violet-700">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold shadow-lg mb-4 transition-transform duration-300 group-hover:scale-110`} aria-hidden="true">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Benefits ─────────────────────────────────── */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-violet-50/50 dark:from-gray-950 dark:to-violet-950/20" aria-labelledby="benefits-title">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 id="benefits-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Por que usar o Pasty?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-12 max-w-md mx-auto">
            Mais que um bloco de notas — uma ponte entre seus dispositivos
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map(({ icon, title, desc }, index) => (
              <div
                key={title}
                className="group flex gap-4 p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-950/30 hover:border-violet-200 dark:hover:border-violet-700 hover:-translate-y-0.5"
                style={{ animation: `fade-in 0.4s ease-out ${0.1 * index}s both` }}
              >
                <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-125" aria-hidden="true">{icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-purple-600/5 dark:from-violet-600/10 dark:to-purple-600/10" aria-hidden="true" />

        <div className="relative max-w-2xl mx-auto px-4 py-20 text-center">
          <span className="text-4xl block mb-4" aria-hidden="true">🚀</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Experimente grátis agora
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Não precisa de cartão de crédito. Apenas sua conta Google e pronto.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
            >
              Começar agora
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/save-text-online"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
            >
              Saber mais
            </Link>
          </div>
        </div>
      </section>

      <AdBanner />

      <Footer />
    </div>
  )
}
