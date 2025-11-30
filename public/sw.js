const CACHE_NAME = "dvm-league-v2"
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

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response
        }

        // Try to fetch from network
        return fetch(event.request)
          .then((fetchResponse) => {
            // Only cache successful GET requests for same-origin resources
            if (
              fetchResponse &&
              fetchResponse.status === 200 &&
              fetchResponse.type === "basic" &&
              event.request.method === "GET"
            ) {
              const responseToCache = fetchResponse.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache).catch((error) => {
                  console.error("[SW] Failed to cache response:", error)
                })
              })
            }
            return fetchResponse
          })
          .catch((error) => {
            console.error("[SW] Fetch failed for:", event.request.url, error)

            // For navigation requests, return a basic HTML response instead of failing
            if (event.request.mode === "navigate") {
              return new Response(
                "<!DOCTYPE html><html><head><title>Loading...</title></head><body><script>window.location.reload()</script></body></html>",
                {
                  headers: { "Content-Type": "text/html" },
                },
              )
            }

            // For other requests, throw the error to let the browser handle it
            throw error
          })
      })
      .catch((error) => {
        console.error("[SW] Cache match failed:", error)
        // If everything fails, try a direct fetch as last resort
        return fetch(event.request).catch(() => {
          // Return empty response if all else fails
          return new Response("", { status: 503, statusText: "Service Unavailable" })
        })
      }),
  )
})

self.addEventListener("activate", (event) => {
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
