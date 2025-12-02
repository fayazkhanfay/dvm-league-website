const CACHE_NAME = "dvm-league-v7"
const urlsToCache = [
  "/manifest.json",
  "/favicon.ico",
  "/favicon.svg",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
]

self.addEventListener("install", (event) => {
  console.log("[SW] Installing v7 - fetch interception disabled...")
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("[SW] Failed to cache some resources during install:", error)
        return Promise.resolve()
      })
    }),
  )
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating v7...")
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME) {
                console.log("[SW] Deleting old cache:", cacheName)
                return caches.delete(cacheName)
              }
            }),
          )
        }),
      // Take control immediately
      self.clients.claim(),
    ]),
  )
})

// Fetch event listener removed to stop interfering with navigation
// Next.js will handle all navigation and routing without interference
