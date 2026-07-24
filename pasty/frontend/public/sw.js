// Pasty — Service Worker
// Cache name with version for easy updates
const CACHE = 'pasty-v1'

// Assets to pre-cache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/favicon.svg',
  '/robots.txt',
  '/sitemap.xml',
]

// Install: pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(PRECACHE).catch(() => {
        // Assets pré-cacheados parcialmente — aceitável para MVP
      })
    }),
  )
  // Activate immediately — don't wait for old SW to close
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  )
  // Take control of all clients immediately
  self.clients.claim()
})

// Fetch: network first, fallback to cache for navigation
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // For navigation requests (HTML pages), try network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response for offline
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => {
          // Offline: serve cached index.html for SPA routing
          return caches.match('/index.html')
        }),
    )
    return
  }

  // For static assets: cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached response if available
      if (cached) return cached

      // Otherwise fetch from network and cache the response
      return fetch(event.request).then((response) => {
        // Don't cache API calls or non-ok responses
        if (
          !response.ok ||
          event.request.url.includes('/api/')
        ) {
          return response
        }

        const clone = response.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        return response
      })
    }),
  )
})
