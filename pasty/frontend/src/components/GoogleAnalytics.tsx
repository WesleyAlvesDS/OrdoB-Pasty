import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Google Analytics 4 component.
 *
 * To enable:
 * 1. Create a GA4 property in https://analytics.google.com/
 * 2. Set VITE_GA_MEASUREMENT_ID in your environment (Vercel/Railway)
 *
 * Example: VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ''

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function GoogleAnalytics() {
  const location = useLocation()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    // Load gtag script once
    if (!document.querySelector(`script[data-ga="${GA_MEASUREMENT_ID}"]`)) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      script.async = true
      script.setAttribute('data-ga', GA_MEASUREMENT_ID)
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false,
      })
    }
  }, [])

  // Track page views on route change
  useEffect(() => {
    if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [location])

  return null
}
