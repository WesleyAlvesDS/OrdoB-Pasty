import { useEffect } from 'react'

interface SEOProps {
  title: string
  description: string
  canonical?: string
  ogType?: string
  ogImage?: string
  jsonLd?: Record<string, unknown>
}

const SITE_NAME = 'Pasty'
const DEFAULT_DESC = 'Cole qualquer texto e salve instantaneamente no Google Docs, Google Drive ou Gmail. Rápido, seguro e 100% grátis.'
const DEFAULT_IMAGE = 'https://pasty.ordob.com/og-image.png'

export function SEO({
  title,
  description = DEFAULT_DESC,
  canonical = 'https://pasty.ordob.com/',
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  jsonLd,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`

  useEffect(() => {
    document.title = fullTitle

    function setMeta(name: string, content: string) {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLElement | null
      if (!el) {
        el = document.createElement('meta')
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          el.setAttribute('property', name)
        } else {
          el.setAttribute('name', name)
        }
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('description', description)
    setMeta('og:title', fullTitle)
    setMeta('og:description', description)
    setMeta('og:url', canonical)
    setMeta('og:type', ogType)
    setMeta('og:image', ogImage)
    setMeta('og:site_name', SITE_NAME)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)
    setMeta('twitter:image', ogImage)

    // Canonical
    let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!linkEl) {
      linkEl = document.createElement('link')
      linkEl.rel = 'canonical'
      document.head.appendChild(linkEl)
    }
    linkEl.href = canonical

    // JSON-LD
    const scriptId = jsonLd ? `json-ld-${title.replace(/\s+/g, '-').toLowerCase()}` : null
    if (jsonLd && scriptId) {
      let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null
      if (!scriptEl) {
        scriptEl = document.createElement('script')
        scriptEl.id = scriptId
        scriptEl.type = 'application/ld+json'
        document.head.appendChild(scriptEl)
      }
      scriptEl.textContent = JSON.stringify(jsonLd)
    }

    return () => {
      // Cleanup: remove JSON-LD scripts added by this component instance
      if (scriptId) {
        const scriptEl = document.getElementById(scriptId)
        if (scriptEl) scriptEl.remove()
      }
    }
  }, [fullTitle, description, canonical, ogType, ogImage, jsonLd])

  return null
}

/** Pre-built JSON-LD schemas */

export const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Pasty',
  url: 'https://pasty.ordob.com',
  description: DEFAULT_DESC,
  applicationCategory: 'Utility',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
  author: {
    '@type': 'Organization',
    name: 'OrdoB',
    url: 'https://ordob.com',
  },
}

export function faqJsonLd(questions: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
