import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SEO, breadcrumbJsonLd } from '../components/SEO'
import { Footer } from '../components/Footer'

const sections = [
  {
    title: '1. Informações que coletamos',
    content: `Ao utilizar o Pasty, podemos coletar as seguintes informações:
• Informações da conta Google: nome, e-mail e foto de perfil (via OAuth 2.0)
• Conteúdo dos textos que você opta por salvar (apenas para processamento)
• Dados de uso anônimos para melhoria da experiência (via Google Analytics)
• Informações básicas do navegador e dispositivo para funcionamento adequado`,
  },
  {
    title: '2. Como usamos suas informações',
    content: `Seus dados são utilizados exclusivamente para:
• Autenticar sua conta e permitir o uso do serviço
• Processar e salvar seus textos nos serviços Google que você escolher (Docs, Drive ou Gmail como rascunho)
• Melhorar a experiência do usuário com base em dados anônimos de uso
• NUNCA vendemos, alugamos ou compartilhamos seus dados com terceiros`,
  },
  {
    title: '3. Armazenamento e segurança',
    content: `O Pasty adota práticas rigorosas de segurança:
• Os textos processados são armazenados apenas nos serviços Google que você escolher
• Tokens de acesso são criptografados e armazenados em banco de dados seguro (PostgreSQL)
• Utilizamos criptografia TLS/SSL em todas as comunicações
• Tokens de atualização (refresh tokens) permitem acesso contínuo sem reautenticação constante`,
  },
  {
    title: '4. Seus direitos (LGPD)',
    content: `De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), você tem direito a:
• Acessar seus dados pessoais a qualquer momento
• Solicitar correção de dados incompletos ou desatualizados
• Solicitar exclusão dos seus dados e da sua conta
• Revogar o consentimento a qualquer momento
• Saber com quais entidades compartilhamos seus dados
• Ser informado sobre a possibilidade de não fornecer consentimento`,
  },
  {
    title: '5. Compartilhamento de dados',
    content: `O Pasty compartilha dados apenas com:
• Google (via OAuth 2.0) — para autenticação e salvamento nos serviços Google
• Vercel — para hospedagem do frontend
• Railway / Render — para hospedagem do backend e banco de dados
Nenhum dado é compartilhado com anunciantes, redes de anúncios ou terceiros não essenciais.`,
  },
  {
    title: '6. Cookies e tecnologias',
    content: `Utilizamos cookies essenciais para:
• Manter sua sessão autenticada
• Lembrar suas preferências de salvamento
• Google Analytics (anônimo) para entender padrões de uso
Você pode desabilitar cookies nas configurações do seu navegador, mas algumas funcionalidades podem ser afetadas.`,
  },
  {
    title: '7. Contato e DPO',
    content: `Para questões sobre privacidade e proteção de dados:
• E-mail: privacy@ordob.com
• Tempo de resposta: até 48 horas úteis
• Nos comprometemos a responder todas as solicitações dentro do prazo legal da LGPD`,
  },
  {
    title: '8. Alterações nesta política',
    content: `Esta política pode ser atualizada periodicamente. Recomendamos revisá-la regularmente. A versão mais recente estará sempre disponível nesta página. Data da última atualização: 12 de agosto de 2026.`,
  },
  {
    title: '9. Publicidade de terceiros',
    content: `Para manter o Pasty 100% gratuito, o site exibe anúncios de parceiros (Adsterra / Effective CPM Network):
• Os anúncios podem usar cookies e armazenamento local para medir eficiência e exibir conteúdo mais relevante
• Os provedores de anúncios podem coletar dados de navegação anônimos (ex.: páginas visitadas, tipo de dispositivo)
• Utilizamos "links inteligentes" patrocinados que podem registrar o clique para fins de medição de campanha
• Não compartilhamos seus textos, e-mail ou dados da conta Google com anunciantes
• Você pode optar por não receber anúncios personalizados ajustando as preferências de publicidade do seu navegador ou Google`,
  },
]

const pageJsonLd = breadcrumbJsonLd([
  { name: 'Início', url: 'https://pasty.ordob.com/' },
  { name: 'Política de Privacidade', url: 'https://pasty.ordob.com/privacy' },
])

export function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Política de Privacidade"
        description="Sua privacidade é prioridade. Saiba como o Pasty coleta, usa, armazena e protege suas informações pessoais em conformidade com a LGPD."
        canonical="https://pasty.ordob.com/privacy"
        ogType="website"
        jsonLd={pageJsonLd}
      />

      <Header user={null} />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-purple-600/5 dark:from-violet-600/10 dark:to-purple-600/10" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 text-xs font-medium border border-violet-200 dark:border-violet-800">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" aria-hidden="true" />
            Transparência total
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            Política de Privacidade
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Sua privacidade é prioridade. Saiba como coletamos, usamos e protegemos seus dados.
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Última atualização: 13 de julho de 2026
          </p>
        </div>
      </section>

      {/* ─── Conteúdo ─────────────────────────────────── */}
      <section className="flex-1 max-w-3xl mx-auto px-4 pb-16">
        <div className="space-y-10">
          <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              Esta Política de Privacidade descreve como o <strong>Pasty</strong> coleta, usa,
              armazena e protege suas informações pessoais quando você utiliza nosso serviço.
              Estamos comprometidos com a proteção dos seus dados em conformidade com a{' '}
              <strong>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>.
            </p>
          </div>

          {sections.map((section, index) => (
            <div
              key={section.title}
              className="group"
              style={{ animation: `fade-in 0.4s ease-out ${index * 0.06}s both` }}
            >
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-950/30 hover:border-violet-200 dark:hover:border-violet-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" aria-hidden="true" />
                  {section.title}
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </div>
          ))}

          {/* ─── Resumo final ─────────────────────────── */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 text-center">
            <span className="text-3xl block mb-3" aria-hidden="true">🔒</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Seus dados, seu controle. Em caso de dúvidas, entre em contato conosco.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Voltar ao Pasty
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
