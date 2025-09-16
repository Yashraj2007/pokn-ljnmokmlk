const CACHE_NAME = "pmis-v1.0.0"
const STATIC_CACHE = "pmis-static-v1"
const DYNAMIC_CACHE = "pmis-dynamic-v1"

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/favicon.ico",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
]

// API routes to cache with network-first strategy
const API_ROUTES = ["/api/candidates", "/api/recommendations", "/api/analytics/dashboard"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Handle static assets with cache-first strategy
  if (STATIC_ASSETS.some((asset) => url.pathname.includes(asset))) {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(navigationStrategy(request))
    return
  }

  // Default: network-first for everything else
  event.respondWith(networkFirstStrategy(request))
})

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url)
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline fallback for API requests
    if (request.url.includes("/api/")) {
      return new Response(
        JSON.stringify({
          error: "Offline",
          message: "You are currently offline. Please check your connection.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    throw error
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    console.error("[SW] Failed to fetch static asset:", request.url)
    throw error
  }
}

// Navigation strategy with offline fallback
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    console.log("[SW] Navigation offline, serving cached page")
    const cachedResponse = await caches.match("/")

    if (cachedResponse) {
      return cachedResponse
    }

    // Return basic offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>PMIS - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <h1>You're Offline</h1>
          <p class="offline">Please check your internet connection and try again.</p>
          <p>You can still access cached content when you're back online.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } },
    )
  }
}

// Background sync for form submissions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "profile-sync") {
    event.waitUntil(syncProfileData())
  } else if (event.tag === "application-sync") {
    event.waitUntil(syncApplicationData())
  }
})

// Sync cached profile data when online
async function syncProfileData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()

    for (const request of requests) {
      if (request.url.includes("/api/candidates") && request.method === "POST") {
        const response = await cache.match(request)
        const data = await response.json()

        // Retry the request
        await fetch(request.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        // Remove from cache after successful sync
        await cache.delete(request)
      }
    }
  } catch (error) {
    console.error("[SW] Profile sync failed:", error)
  }
}

// Sync cached application data when online
async function syncApplicationData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const requests = await cache.keys()

    for (const request of requests) {
      if (request.url.includes("/api/applications") && request.method === "POST") {
        const response = await cache.match(request)
        const data = await response.json()

        // Retry the request
        await fetch(request.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        // Remove from cache after successful sync
        await cache.delete(request)
      }
    }
  } catch (error) {
    console.error("[SW] Application sync failed:", error)
  }
}

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "New internship recommendations available!",
    icon: "/logo192.png",
    badge: "/logo192.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/recommendations",
    },
    actions: [
      {
        action: "view",
        title: "View Recommendations",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("PMIS Recommendation Engine", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(clients.openWindow("/recommendations"))
  }
})
