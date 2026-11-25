const CACHE_NAME = 'parking-locator-v2'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icon.svg']

async function cacheAppShell() {
  const response = await fetch('/index.html', { cache: 'reload' })
  if (!response.ok) throw new Error('Could not load the app shell')

  const html = await response.clone().text()
  const assets = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => new URL(match[1], self.location.origin))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => `${url.pathname}${url.search}`)

  const cache = await caches.open(CACHE_NAME)
  await cache.put('/index.html', response)
  await cache.addAll([...new Set([...APP_SHELL, ...assets])])
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell())
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return
  event.respondWith((async () => {
    const cached = await caches.match(event.request)
    if (cached) return cached
    try {
      const response = await fetch(event.request)
      if (response.ok) {
        await caches.open(CACHE_NAME)
          .then((cache) => cache.put(event.request, response.clone()))
          .catch(() => {})
      }
      return response
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const appShell = await caches.match('/index.html')
        if (appShell) return appShell
      }
      throw error
    }
  })())
})
