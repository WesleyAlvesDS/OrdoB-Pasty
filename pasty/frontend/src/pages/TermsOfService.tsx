import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header'
import { SEO, breadcrumbJsonLd } from '../components/SEO'
import { Footer } from '../components/Footer'

const sections = [
  {
    title: '1. Aceitação dos Termos',
    content: `Ao acessar ou utilizar o Pasty, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte dos termos, não poderá utilizar nossos serviços. Estes termos se aplicam a todos os visitantes, usuários e outras pessoas que acessam ou utilizam o serviço.`,
  },
  {
    title: '2. Descrição do Serviço',
    content: `O Pasty é uma ferramenta web que permite aos usuários:
• Colar e salvar textos diretamente no Google Docs, Google Drive ou Gmail
• Gerenciar e visualizar o histórico de textos salvos
• Acessar o serviço de qualquer dispositivo com navegador moderno

O Pasty atua como uma interface intermediária — o conteúdo dos textos é armazenado exclusivamente nos serviços Google que você escolher.`,
  },
  {
    title: '3. Conta do Usuário',
    content: `Para utilizar o Pasty, você precisa:
• Ter uma conta Google válida
• Autorizar as permissões necessárias via OAuth 2.0
• Manter suas credenciais de acesso em sigilo
• Não compartilhar sua conta com terceiros

Você é responsável por todas as atividades realizadas em sua conta.`,
  },
  {
    title: '4. Uso Aceitável',
    content: `Você concorda em não utilizar o Pasty para:
• Enviar conteúdo ilegal, ofensivo ou que viole direitos de terceiros
• Realizar spam ou envio não solicitado de conteúdo
• Tentar burlar sistemas de segurança ou limites de uso
• Realizar engenharia reversa ou extrair código-fonte do serviço
• Violar leis locais, nacionais ou internacionais

Reservamo-nos o direito de suspender contas que violem estas regras.`,
  },
  {
    title: '5. Propriedade Intelectual',
    content: `O Pasty é um software proprietário. Todos os direitos de propriedade intelectual relacionados ao serviço, incluindo mas não se limitando ao código-fonte, design, logotipos e marca, pertencem aos seus criadores.\n\nO conteúdo que você salva através do Pasty permanece de sua propriedade. Não reivindicamos qualquer propriedade sobre os textos que você processa através do nosso serviço.`,
  },
  {
    title: '6. Limitação de Responsabilidade',
    content: `O Pasty é fornecido "como está", sem garantias de qualquer tipo, expressas ou implícitas. Não garantimos que:
• O serviço será ininterrupto ou livre de erros
• Os resultados obtidos atenderão às suas expectativas
• Erros no serviço serão corrigidos

Em nenhuma circunstância o Pasty será responsável por danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou da incapacidade de usar o serviço.`,
  },
  {
    title: '7. Privacidade e Dados',
    content: `Nosso compromisso com sua privacidade está detalhado na Política de Privacidade. Ao usar o Pasty, você concorda com as práticas descritas nessa política.\n\nEm resumo:\n• Seus textos são salvos apenas nos serviços Google que você escolher\n• Seus dados de conta (nome, email) são usados apenas para autenticação\n• Não vendemos, alugamos ou compartilhamos seus dados com terceiros`,
  },
  {
    title: '8. Alterações nos Termos',
    content: `Estes Termos de Uso podem ser alterados periodicamente. Notificaremos sobre alterações materiais através do site ou por email. O uso continuado do serviço após as alterações constitui aceitação dos novos termos.\n\nRecomendamos revisar estes termos regularmente. Última atualização: 13 de julho de 2026.`,
  },
  {
    title: '9. Contato',
    content: `Para questões relacionadas a estes Termos de Uso:\n• E-mail: legal@pasty.app\n• Tempo de resposta: até 48 horas úteis\n\nEstes termos são regidos pelas leis da República Federativa do Brasil.`,
  },
]

const pageJsonLd = breadcrumbJsonLd([
  { name: 'Início', url: 'https://pasty.ordob.com/' },
  { name: 'Termos de Uso', url: 'https://pasty.ordob.com/terms' },
])

export function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <SEO
        title="Termos de Uso"
        description="Ao utilizar o Pasty, você concorda com estes Termos de Uso. Leia com atenção nossas condições, direitos e responsabilidades."
        canonical="https://pasty.ordob.com/terms"
        ogType="website"
        jsonLd={pageJsonLd}
      />

      <Header user={null} />

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-orange-600/5 dark:from-amber-600/10 dark:to-orange-600/10" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
            Leia com atenção
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            Termos de Uso
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Ao utilizar o Pasty, você concorda com estes termos. Leia com atenção.
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Última atualização: 13 de julho de 2026
          </p>
        </div>
      </section>

      {/* ─── Conteúdo ─────────────────────────────────── */}
      <section className="flex-1 max-w-3xl mx-auto px-4 pb-16">
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={section.title}
              style={{ animation: `fade-in 0.4s ease-out ${index * 0.05}s both` }}
            >
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-950/30 hover:border-amber-200 dark:hover:border-amber-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" aria-hidden="true" />
                  {section.title}
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </div>
          ))}

          {/* ─── CTA ──────────────────────────────────── */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-3xl block mb-3" aria-hidden="true">📜</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-4">
              Dúvidas sobre os termos? Entre em contato conosco.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Voltar ao Pasty
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
              >
                Ver Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
