import { useEffect, useState, useCallback } from 'react'

interface Testimonial {
  quote: string
  name: string
  role: string
  initial: string
  gradient: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Antes gastava 5 minutos por dia enviando textos do celular para o PC. Agora é 10 segundos. O Pasty salvou horas da minha semana.',
    name: 'Marcos Silva',
    role: 'Engenheiro de Software',
    initial: 'M',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    quote:
      'Uso o Pasty todos os dias para mandar artigos do celular para o Google Docs. Simples, rápido e confiável.',
    name: 'Ana Costa',
    role: 'Designer UX',
    initial: 'A',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    quote:
      'A praticidade é incrível. Gere um QR Code na hora e transfira o texto do celular direto para o computador, sem apps nem fios. As ferramentas de limpeza e formatação também me economizam tempo todo dia.',
    name: 'Rafael Martins',
    role: 'Professor de História',
    initial: 'R',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    quote:
      'Uso muito as ferramentas integradas: estatísticas, limpeza de texto e exportação. O modo apresentação virou meu favorito para revisar conteúdos longos com os alunos.',
    name: 'Juliana Pereira',
    role: 'Coordenadora Pedagógica',
    initial: 'J',
    gradient: 'from-sky-400 to-blue-500',
  },
]

const INTERVAL = 6000

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((i: number) => {
    setIndex(((i % testimonials.length) + testimonials.length) % testimonials.length)
  }, [])

  const next = useCallback(() => goTo(index + 1), [index, goTo])
  const prev = useCallback(() => goTo(index - 1), [index, goTo])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, INTERVAL)
    return () => clearInterval(timer)
  }, [next, paused])

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Trilho deslizante */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {testimonials.map((t) => (
            <div key={t.name} className="w-full flex-shrink-0">
              <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm h-full">
                {/* Aspas decorativas */}
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center mb-4" aria-hidden="true">
                  <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                </div>
                <blockquote className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                  <span className="text-violet-600 dark:text-violet-400 font-serif text-3xl leading-none align-top mr-1" aria-hidden="true">
                    "
                  </span>
                  {t.quote}
                  <span className="text-violet-600 dark:text-violet-400 font-serif text-3xl leading-none align-bottom ml-1" aria-hidden="true">
                    "
                  </span>
                </blockquote>
                <div className="mt-5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white`}>
                    {t.initial}
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      {t.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{t.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver depoimento de ${t.name}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === index
                  ? 'w-6 bg-violet-600'
                  : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Depoimento anterior"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo depoimento"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
