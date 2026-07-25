import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// ─── PWA: Register Service Worker ───────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope)
      })
      .catch((error) => {
        console.log('[PWA] Service Worker registration failed:', error)
      })
  })
}

// ─── Render ─────────────────────────────────────────────────

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Ensure there is a <div id="root"> in your HTML.')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
