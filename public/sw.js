const CACHE_NAME = "dvm-league-v6"
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
  console.log("[SW] Installing v6...")
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
  console.log("[SW] Activating v6...")
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

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Skip all navigation requests - let Next.js handle routing
  if (event.request.mode === "navigate") {
    console.log("[SW] Skipping navigation request:", url.pathname)
    return
  }

  // Skip all API and dynamic requests
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/") || url.search.includes("_rsc=")) {
    return
  }

  // Only cache manifest and icon files from our whitelist
  const shouldCache = urlsToCache.some((path) => url.pathname === path)

  if (!shouldCache) {
    return
  }

  // Cache-first strategy for static assets only
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((fetchResponse) => {
        if (fetchResponse && fetchResponse.status === 200) {
          const responseToCache = fetchResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return fetchResponse
      })
    }),
  )
})
