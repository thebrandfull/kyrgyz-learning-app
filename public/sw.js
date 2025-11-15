const CACHE_NAME = 'kyrgyz-learning-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, then cache fallback
self.addEventListener('fetch', (event) => {
  const url = event.request.url

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip non-http(s) requests (chrome-extension, etc.)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return
  }

  // Skip API calls (don't cache API responses)
  if (url.includes('/api/') ||
      url.includes('elevenlabs.io') ||
      url.includes('deepseek.com') ||
      url.includes('supabase.co')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses from our domain
        if (response && response.status === 200 && url.startsWith(self.location.origin)) {
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(err => {
              // Silently ignore cache errors
            })
          })
        }

        return response
      })
      .catch(() => {
        return caches.match(event.request)
      })
  )
})
