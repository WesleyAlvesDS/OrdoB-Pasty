import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SEO, faqJsonLd, breadcrumbJsonLd } from '../components/SEO'
import { Footer } from '../components/Footer'
import { AdBanner } from '../components/AdBanner'

const steps = [
  { icon: '🔑', title: 'Login com Google', desc: 'Use sua conta Google para entrar. Rápido e seguro — sem criar nova senha.' },
  { icon: '📝', title: 'Cole o texto', desc: 'Copie de qualquer lugar e cole no campo de texto. Funciona com qualquer conteúdo.' },
  { icon: '💾', title: 'Escolha e salve', desc: 'Selecione Docs, Drive ou Gmail e salve instantaneamente.' },
]

const comparisons = [
  { feature: 'Grátis', us: '✅', other1: '✅', other2: '✅' },
  { feature: 'Acessível em qualquer dispositivo', us: '✅', other1: '❌', other2: '✅' },
  { feature: 'Salva no Google Drive/Docs', us: '✅', other1: '❌', other2: '❌' },
  { feature: 'Sem instalar app', us: '✅', other1: '✅', other2: '❌' },
  { feature: 'Detecta duplicidade', us: '✅', other1: '❌', other2: '❌' },
  { feature: 'Criptografia de ponta a ponta', us: '✅', other1: '❌', other2: '❌' },
]

const faqs = [
  { q: 'É realmente grátis?', a: 'Sim! O Pasty é 100% grátis durante o MVP. Você só precisa de uma conta Google — sem cartão de crédito, sem trial.' },
  { q: 'Preciso instalar algum aplicativo?', a: 'Não. Funciona em qualquer navegador moderno — celular, tablet ou computador. Apenas abra o site e use.' },
  { q: 'Onde meus textos ficam salvos?', a: 'No Google Docs, Google Drive ou Gmail — você escolhe. Nós não armazenamos o conteúdo dos seus textos no Pasty.' },
  { q: 'Funciona no celular?', a: 'Sim! O site é totalmente responsivo e funciona perfeitamente no navegador do celular, tablet ou PC.' },
  { q: 'Posso salvar textos grandes?', a: 'Sim, não há limite de tamanho. Mas lembre-se de que cada serviço Google tem suas próprias limitações.' },
]

const pageJsonLd = breadcrumbJsonLd([
  { name: 'Início', url: 'https://pasty.ordob.com/' },
  { name: 'Salvar texto online', url: 'https://pasty.ordob.com/save-text-online' },
])

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
      <h3>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
          aria-expanded={open}
          aria-controls={`faq-answer-${q.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <span className="text-sm font-medium text-gray-900 dark:text-white">{q}</span>
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h3>
      <div
        id={`faq-answer-${q.replace(/\s+/g, '-').toLowerCase()}`}
        role="region"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {a}
        </p>
      </div>
    </div>
  )
}

export function SaveTextOnline() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Salvar texto online grátis | Cole e acesse de qualquer lugar"
        description="Salve texto online em segundos e acesse de qualquer dispositivo. Cole no Pasty, escolha Google Docs, Drive ou Gmail e pronto. 100% grátis."
        canonical="https://pasty.ordob.com/save-text-online"
        ogType="website"
        jsonLd={{ ...faqJsonLd(faqs), ...pageJsonLd }}
      />

      <Header user={null} />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <div
              className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
              style={{ animation: 'fade-in 0.5s ease-out both' }}
            >
              ✅ Grátis — sem cadastro extra
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.05] tracking-tight"
              style={{ animation: 'fade-in 0.5s ease-out 0.1s both' }}
            >
              Salve texto{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                online grátis
              </span>
            </h1>

            <p
              className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed"
              style={{ animation: 'fade-in 0.5s ease-out 0.2s both' }}
            >
              Precisa salvar um texto rapidamente e acessar de qualquer lugar?
              O Pasty deixa você colar, salvar e acessar seus textos
              no Google Drive, Docs ou Gmail em segundos.
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{ animation: 'fade-in 0.5s ease-out 0.3s both' }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
              >
                Salvar texto agora
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/send-text-to-pc"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
              >
                Enviar do celular para o PC
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Steps ────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-16" aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Como salvar texto online
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-12 max-w-md mx-auto">
          Três passos simples para nunca mais perder um texto importante
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map(({ icon, title, desc }, index) => (
            <div
              key={title}
              className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100/50 dark:hover:shadow-emerald-950/30 hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-700"
              style={{ animation: `fade-in 0.4s ease-out ${0.1 * index}s both` }}
            >
              <span className="text-3xl block mb-4 transition-transform duration-300 group-hover:scale-125" aria-hidden="true">{icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Comparison Table ─────────────────────────── */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-emerald-50/50 dark:from-gray-950 dark:to-emerald-950/20" aria-labelledby="comparison-title">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 id="comparison-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Por que escolher o Pasty?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-10 max-w-md mx-auto">
            Comparação com alternativas comuns
          </p>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left py-4 px-5 font-semibold text-gray-900 dark:text-white">Funcionalidade</th>
                  <th className="text-center py-4 px-5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="inline-flex items-center gap-1">
                      Pasty
                      <span className="text-xs" aria-hidden="true">⭐</span>
                    </span>
                  </th>
                  <th className="text-center py-4 px-5 font-semibold text-gray-500">Bloco de Notas</th>
                  <th className="text-center py-4 px-5 font-semibold text-gray-500">E-mail p/ si mesmo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {comparisons.map(({ feature, us, other1, other2 }, index) => (
                  <tr
                    key={feature}
                    className="transition-colors duration-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                    style={{ animation: `fade-in 0.3s ease-out ${0.05 * index}s both` }}
                  >
                    <td className="py-3.5 px-5 text-gray-700 dark:text-gray-300 font-medium">{feature}</td>
                    <td className="text-center py-3.5 px-5 text-lg" aria-label="Disponível">{us}</td>
                    <td className="text-center py-3.5 px-5 text-lg text-gray-300 dark:text-gray-600" aria-label="Não disponível">{other1}</td>
                    <td className="text-center py-3.5 px-5 text-lg text-gray-300 dark:text-gray-600" aria-label="Não disponível">{other2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-16" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
          Perguntas frequentes
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-10 max-w-md mx-auto">
          Tire suas dúvidas sobre o Pasty
        </p>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{ animation: `fade-in 0.3s ease-out ${0.05 * index}s both` }}
            >
              <FAQItem
                q={faq.q}
                a={faq.a}
                open={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Final ────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-transparent to-teal-600/5 dark:from-emerald-600/10 dark:to-teal-600/10" aria-hidden="true" />

        <div className="relative max-w-2xl mx-auto px-4 py-20 text-center">
          <span className="text-4xl block mb-4" aria-hidden="true">✨</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Pronto para salvar texto online?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Leva 10 segundos. Sua conta Google é tudo que você precisa.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
          >
            Salvar texto agora
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <AdBanner />

      <Footer />
    </div>
  )
}
