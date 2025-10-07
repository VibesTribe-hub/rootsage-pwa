const CACHE_NAME = 'rootsage-v1';
const APP_SHELL_URLS = [
    '/', // Caches the main HTML file
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
];
// Installation event: Caching the App Shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(APP_SHELL_URLS);
            })
            .catch(err => {
                console.error('[Service Worker] Failed to cache app shell:', err);
            })
    );
    self.skipWaiting();
});
// Activation event: Cleaning up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
// Fetch event: Serve content from cache first, fall back to network
self.addEventListener('fetch', (event) => {
    const isAppShell = APP_SHELL_URLS.some(url => event.request.url.includes(url) || event.request.url.endsWith(url.replace('/', '')));
    if (isAppShell || event.request.mode === 'navigate') {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                })
                .catch(error => {
                    console.error('[Service Worker] Fetch failed:', error);
                })
        );
    }
    // Allow other requests (like API calls) to proceed normally (network only)
});
