const CACHE_NAME = "dvm-league-v5"
const urlsToCache = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/favicon.svg",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
]

self.addEventListener("install", (event) => {
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("[SW] Failed to cache some resources during install:", error)
        // Continue installation even if some resources fail to cache
        return Promise.resolve()
      })
    }),
  )
})

self.addEventListener("activate", (event) => {
  self.clients.claim()

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
