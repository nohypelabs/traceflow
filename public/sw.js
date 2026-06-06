// TraceFlow Service Worker
// PWA support without offline mode (real-time app)

const CACHE_NAME = 'traceflow-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network only (no offline fallback)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Network only - no caching for dynamic content
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return a simple offline page for navigation requests
      if (event.request.mode === 'navigate') {
        return new Response(
          `<!DOCTYPE html>
          <html>
            <head>
              <title>TraceFlow - Offline</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: #0B1020;
                  color: white;
                  text-align: center;
                }
                .container { padding: 20px; }
                h1 { font-size: 24px; margin-bottom: 10px; }
                p { color: #888; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>📍 TraceFlow</h1>
                <p>No internet connection. Please check your network.</p>
              </div>
            </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
      return new Response('Offline', { status: 503 });
    })
  );
});
