import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SEO, breadcrumbJsonLd, faqJsonLd } from '../components/SEO'
import { Footer } from '../components/Footer'
import { AdBanner } from '../components/AdBanner'

const steps = [
  {
    number: '01',
    title: 'Acesse o Pasty',
    description: 'Abra pasty.ordob.com no navegador do seu celular, tablet ou computador.',
    icon: '🌐',
  },
  {
    number: '02',
    title: 'Faça login com Google',
    description: 'Clique em "Login com Google" e autorize o acesso à sua conta. É rápido, seguro e sem cadastro extra.',
    icon: '🔑',
  },
  {
    number: '03',
    title: 'Cole o texto',
    description: 'Digite ou cole o texto que deseja salvar no campo de texto. Dê um título opcional.',
    icon: '📝',
  },
  {
    number: '04',
    title: 'Escolha o destino',
    description: 'Selecione Google Docs, Google Drive ou Gmail Draft como destino do seu texto.',
    icon: '🎯',
  },
  {
    number: '05',
    title: 'Salve',
    description: 'Clique em "Salvar" e pronto! Seu texto será enviado automaticamente ao destino escolhido.',
    icon: '💾',
  },
]

const faqs = [
  {
    q: 'Preciso instalar algum aplicativo no celular?',
    a: 'Não! Abra o navegador do celular (Chrome, Safari, etc.) e acesse pasty.ordob.com. Funciona em qualquer dispositivo moderno.',
  },
  {
    q: 'Como faço para transferir texto do celular para o PC?',
    a: 'Acesse pasty.ordob.com no celular, cole o texto, escolha Google Docs ou Drive como destino, e clique em Salvar. O texto aparecerá automaticamente na sua conta Google, acessível do seu PC.',
  },
  {
    q: 'O Pasty armazena meus textos?',
    a: 'Não! O Pasty apenas envia o texto para o seu Google Docs, Drive ou Gmail. O conteúdo é armazenado apenas nas suas contas Google. Nós apenas mantemos um histórico de metadados (título e data) para sua conveniência.',
  },
  {
    q: 'Posso usar o Pasty no iPhone?',
    a: 'Sim! Funciona perfeitamente no navegador Safari do iPhone. Adicione à tela inicial para um acesso mais rápido.',
  },
  {
    q: 'É possível salvar em múltiplos destinos de uma vez?',
    a: 'Sim! Selecione Google Docs, Drive e Gmail ao mesmo tempo e o texto será salvo em todos os destinos escolhidos em um único clique.',
  },
]

const pageJsonLd = breadcrumbJsonLd([
  { name: 'Início', url: 'https://pasty.ordob.com/' },
  { name: 'Guia completo de uso', url: 'https://pasty.ordob.com/guia' },
])

const pageJsonLdHowTo = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Como usar o Pasty — Guia completo passo a passo',
  description: 'Aprenda a enviar textos do celular para o PC, Google Docs, Drive ou Gmail em 5 passos simples com o Pasty.',
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: `${step.number}. ${step.title}`,
    url: `https://pasty.ordob.com/guia#step-${index + 1}`,
    text: step.description,
  })),
}

export function Guia() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Guia completo: como usar o Pasty | Enviar texto do celular para PC"
        description="Aprenda a usar o Pasty em 5 passos simples. Envie textos do celular para Google Docs, Drive ou Gmail. Guia completo com FAQ e imagens."
        canonical="https://pasty.ordob.com/guia"
        ogType="article"
        jsonLd={{ ...pageJsonLd, ...pageJsonLdHowTo, ...faqJsonLd(faqs) }}
      />

      <Header user={null} />

      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        {/* ─── Hero ─────────────────────────────────────── */}
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Guia completo: como usar o Pasty
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Aprenda a enviar textos do celular para o seu PC, Google Docs, Google Drive ou Gmail
            em apenas 5 passos simples. Sem instalar nada, 100% grátis.
          </p>
        </section>

        {/* ─── Steps ────────────────────────────────────── */}
        <section className="mb-16" aria-labelledby="steps-title">
          <h2 id="steps-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Passo a passo
          </h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                id={`step-${index + 1}`}
                className="group relative flex gap-4 pb-6"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Passo {step.number}: {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-5.5 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────── */}
        <section className="mb-16" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Perguntas frequentes sobre o uso do Pasty
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-all duration-200"
              >
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
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────── */}
        <section className="text-center mb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
          >
            <span className="text-xl">🚀</span>
            Começar a usar agora
          </Link>
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
            Não precisa de cartão de crédito. Sua conta Google é tudo que você precisa.
          </p>
        </section>

        {/* ─── Related links ───────────────────────────── */}
        <section className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Outras páginas úteis:</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/send-text-to-pc"
              className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              Enviar texto do celular para o PC
            </Link>
            <Link
              to="/save-text-online"
              className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
            >
              Salvar texto online
            </Link>
          </div>
        </section>
      </main>

      <AdBanner />
      <Footer />
    </div>
  )
}
