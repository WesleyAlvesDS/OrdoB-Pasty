// Service Worker for Pasty PWA
// Cache strategy: Network First with fallback to cache

const CACHE_NAME = 'pasty-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      )
    }),
  )
  self.clients.claim()
})

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only handle http/https requests. Browser extensions (chrome-extension://),
  // data:, blob:, etc. are not cacheable and must be ignored.
  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API calls (don't cache them)
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful same-origin responses only
        if (response.status === 200 && url.origin === self.location.origin) {
          const clone = response.clone()
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, clone))
            .catch(() => {
              // Ignore cache write failures (e.g. non-cacheable responses)
            })
        }
        return response
      })
      .catch(() => {
        // Offline: serve from cache
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // If it's a navigation request, serve the SPA shell
          if (request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return new Response('Offline', { status: 503 })
        })
      }),
  )
})
