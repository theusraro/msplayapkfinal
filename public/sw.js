const CACHE_VERSION = 'msplay-pwa-v2'
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/favicon.png',
  './assets/app-icon.png',
  './assets/pwa-icon-192.png',
  './assets/pwa-icon-512.png',
  './assets/maskable-icon-512.png',
  './assets/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => {
        if (key !== CACHE_VERSION) return caches.delete(key)
        return null
      })))
      .then(() => self.clients.claim())
  )
})

const isSameOrigin = (requestUrl) => requestUrl.origin === self.location.origin
const isStaticAsset = (requestUrl) => (
  isSameOrigin(requestUrl) &&
  (
    requestUrl.pathname.includes('/assets/') ||
    requestUrl.pathname.endsWith('/manifest.webmanifest')
  )
)

self.addEventListener('fetch', (event) => {
  const { request } = event
  const requestUrl = new URL(request.url)

  if (request.method !== 'GET') return
  if (!isSameOrigin(requestUrl)) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone()
          caches.open(CACHE_VERSION).then(cache => cache.put('./index.html', copy))
          return response
        })
        .catch(() => caches.match('./index.html'))
    )
    return
  }

  if (isStaticAsset(requestUrl)) {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request).then(response => {
          const copy = response.clone()
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy))
          return response
        }))
    )
  }
})
