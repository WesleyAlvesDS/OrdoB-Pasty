import { useEffect, useRef } from 'react'

/**
 * Banner de anúncios Adsterra (rede Effective CPM).
 *
 * O script de invocação é injetado apenas uma vez no <head>. O contêiner
 * é renderizado somente quando o componente está montado, evitando animar
 * o layout ou interferir na experiência do usuário.
 */
const AD_SRC = 'https://pl30727045.effectivecpmnetwork.com/a9860fbedb0b55f36cbf7042ddd6970e/invoke.js'
const AD_CONTAINER_ID = 'container-a9860fbedb0b55f36cbf7042ddd6970e'

export function AdBanner() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Evita duplicar o script em navegações SPA (SPA Router).
    const existing = document.getElementById('adsterra-invoke-script')
    if (existing) return

    const script = document.createElement('script')
    script.id = 'adsterra-invoke-script'
    script.src = AD_SRC
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    document.head.appendChild(script)
  }, [])

  if (!containerRef.current) {
    // fallback: apenas para o primeiro render (createElement ocorre no effect)
  }

  return (
    <div
      className="flex flex-col items-center px-2 my-8"
      role="complementary"
      aria-label="Publicidade"
    >
      <p
        className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400"
        data-testid="ad-disclosure"
      >
        Publicidade
      </p>
      <div
        id={AD_CONTAINER_ID}
        ref={containerRef}
        className="min-h-[90px] w-full max-w-2xl flex items-center justify-center overflow-hidden rounded-xl"
        data-testid="adsterra-banner"
      />
    </div>
  )
}

export default AdBanner