/**
 * IDLPMS Service Worker - Offline Support & Caching
 * ==================================================
 * Provides:
 * - Offline capability for critical pages
 * - Strategic caching (Cache-first, Network-first, Stale-while-revalidate)
 * - Background sync for queued operations
 * - Push notification support (preparation)
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const SW_VERSION = '2.4.0';
const CACHE_PREFIX = 'idlpms';

// Cache names
const CACHES = {
    static: `${CACHE_PREFIX}-static-v${SW_VERSION}`,
    dynamic: `${CACHE_PREFIX}-dynamic-v${SW_VERSION}`,
    images: `${CACHE_PREFIX}-images-v${SW_VERSION}`,
    api: `${CACHE_PREFIX}-api-v${SW_VERSION}`
};

// Files to precache (critical for offline)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/pages/home.html',
    '/assets/css/styles.css',
    '/assets/css/notifications.css',
    '/assets/js/data.js',
    '/assets/js/app.js',
    '/assets/js/chat.js',
    '/assets/js/explorer.js',
    '/assets/js/management.js',
    '/assets/js/notifications.js',
    '/src/services/DataService.js',
    '/src/services/CacheService.js',
    '/src/services/SyncEngine.js',
    '/src/services/AuthService.js',
    '/manifest.json'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Sarabun:wght@100;200;300;400;500;600;700;800&display=swap'
];

// Routes configuration
const ROUTES = {
    // Cache-first: Static assets
    cacheFirst: [
        /\.(?:css|js|woff2?|ttf|otf|eot)$/,
        /\/assets\//,
        /\/src\//
    ],

    // Network-first: API calls, dynamic content, and critical components
    networkFirst: [
        /\/api\//,
        /\.json$/,
        /schedule_grid\.js/,
        /app\.js/,
        /\.html$/,
        /\/pages\//
    ],

    // Stale-while-revalidate: Images only
    staleWhileRevalidate: [
        /\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/
    ],

    // Network-only: Authentication and real-time
    networkOnly: [
        /\/auth\//,
        /\/ws\//,
        /\/realtime\//
    ]
};

// ============================================================================
// INSTALL EVENT
// ============================================================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker v' + SW_VERSION);

    event.waitUntil(
        (async () => {
            // Open static cache
            const cache = await caches.open(CACHES.static);

            // Precache critical assets
            console.log('[SW] Precaching critical assets');

            // Cache local assets
            const localCachePromises = PRECACHE_ASSETS.map(async (url) => {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                        console.log('[SW] Cached:', url);
                    }
                } catch (error) {
                    console.warn('[SW] Failed to cache:', url, error);
                }
            });

            // Cache external resources
            const externalCachePromises = EXTERNAL_RESOURCES.map(async (url) => {
                try {
                    const response = await fetch(url, { mode: 'cors' });
                    if (response.ok) {
                        await cache.put(url, response);
                        console.log('[SW] Cached external:', url);
                    }
                } catch (error) {
                    console.warn('[SW] Failed to cache external:', url, error);
                }
            });

            await Promise.all([...localCachePromises, ...externalCachePromises]);

            // Skip waiting to activate immediately
            self.skipWaiting();
        })()
    );
});

// ============================================================================
// ACTIVATE EVENT
// ============================================================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker v' + SW_VERSION);

    event.waitUntil(
        (async () => {
            // Clean up old caches
            const cacheNames = await caches.keys();
            const validCacheNames = Object.values(CACHES);

            await Promise.all(
                cacheNames
                    .filter(name => name.startsWith(CACHE_PREFIX) && !validCacheNames.includes(name))
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );

            // Take control of all clients immediately
            await self.clients.claim();

            // Notify clients about update
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'SW_ACTIVATED',
                    version: SW_VERSION
                });
            });

            console.log('[SW] Service Worker activated');
        })()
    );
});

// ============================================================================
// FETCH EVENT - Main caching logic
// ============================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Determine caching strategy
    const strategy = getCachingStrategy(url, request);

    event.respondWith(
        handleRequest(request, strategy)
    );
});

/**
 * Determine caching strategy based on URL
 */
function getCachingStrategy(url, request) {
    const pathname = url.pathname;
    const fullUrl = url.href;

    // Network-only routes
    for (const pattern of ROUTES.networkOnly) {
        if (pattern.test(pathname) || pattern.test(fullUrl)) {
            return 'networkOnly';
        }
    }

    // Network-first routes
    for (const pattern of ROUTES.networkFirst) {
        if (pattern.test(pathname) || pattern.test(fullUrl)) {
            return 'networkFirst';
        }
    }

    // Cache-first routes
    for (const pattern of ROUTES.cacheFirst) {
        if (pattern.test(pathname) || pattern.test(fullUrl)) {
            return 'cacheFirst';
        }
    }

    // Stale-while-revalidate routes
    for (const pattern of ROUTES.staleWhileRevalidate) {
        if (pattern.test(pathname) || pattern.test(fullUrl)) {
            return 'staleWhileRevalidate';
        }
    }

    // Default strategy
    return 'networkFirst';
}

/**
 * Handle request with specified strategy
 */
async function handleRequest(request, strategy) {
    switch (strategy) {
        case 'cacheFirst':
            return cacheFirst(request);
        case 'networkFirst':
            return networkFirst(request);
        case 'staleWhileRevalidate':
            return staleWhileRevalidate(request);
        case 'networkOnly':
            return networkOnly(request);
        default:
            return networkFirst(request);
    }
}

// ============================================================================
// CACHING STRATEGIES
// ============================================================================

/**
 * Cache-first strategy
 * Good for: Static assets (CSS, JS, fonts, images)
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        // Return cached response
        return cachedResponse;
    }

    try {
        // Fetch from network
        const response = await fetch(request);

        // Cache if successful
        if (response.ok) {
            const cache = await caches.open(CACHES.static);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.error('[SW] Cache-first fetch failed:', error);
        return createOfflineResponse(request);
    }
}

/**
 * Network-first strategy
 * Good for: API calls, frequently updated content
 */
async function networkFirst(request, timeout = 3000) {
    try {
        // Try network with timeout
        const response = await Promise.race([
            fetch(request),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]);

        // Cache successful responses
        if (response.ok) {
            const cache = await caches.open(CACHES.dynamic);
            cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response
        return createOfflineResponse(request);
    }
}

/**
 * Stale-while-revalidate strategy
 * Good for: Pages, non-critical images
 */
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);

    // Fetch in background to update cache
    const fetchPromise = fetch(request)
        .then(async (response) => {
            if (response.ok) {
                const cache = await caches.open(CACHES.dynamic);
                await cache.put(request, response.clone());
            }
            return response;
        })
        .catch(error => {
            console.warn('[SW] Background fetch failed:', error);
            return null;
        });

    // Return cached response immediately, or wait for network
    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse = await fetchPromise;
    if (networkResponse) {
        return networkResponse;
    }

    return createOfflineResponse(request);
}

/**
 * Network-only strategy
 * Good for: Auth endpoints, WebSocket, real-time data
 */
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.error('[SW] Network-only request failed:', error);
        return createOfflineResponse(request);
    }
}

// ============================================================================
// OFFLINE FALLBACK
// ============================================================================

/**
 * Create offline response based on request type
 */
function createOfflineResponse(request) {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get('Accept') || '';

    // HTML pages - return offline page
    if (acceptHeader.includes('text/html')) {
        return caches.match('/index.html')
            .then(response => response || createOfflineHTML());
    }

    // JSON API - return offline status
    if (acceptHeader.includes('application/json') || url.pathname.includes('/api/')) {
        return new Response(
            JSON.stringify({
                error: 'offline',
                message: 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาลองใหม่อีกครั้ง',
                offline: true,
                timestamp: Date.now()
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    // Images - return placeholder
    if (acceptHeader.includes('image/')) {
        return createOfflinePlaceholderImage();
    }

    // Default offline response
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

/**
 * Create offline HTML response
 */
function createOfflineHTML() {
    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline | IDLPMS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Sarabun', sans-serif;
            background: #1c1c1f; /* Zinc-850 Baseline */
            color: #fafafa;     /* var(--vs-text-title) */
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            text-align: center;
            max-width: 400px;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 24px;
        }
        h1 {
            color: #fafafa;
            font-size: 24px;
            margin-bottom: 16px;
        }
        p {
            color: #71717a;
            margin-bottom: 24px;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #22d3ee; /* var(--vs-accent) */
            color: #1c1c1f;     /* var(--vs-bg-deep) */
            border: none;
            border-radius: 3px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
        }
        .btn:hover { opacity: 0.9; }
        .status {
            margin-top: 24px;
            padding: 12px;
            background: rgba(34, 211, 238, 0.1);
            border: 1px solid rgba(34, 211, 238, 0.3);
            border-radius: 3px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📡</div>
        <h1>ไม่มีการเชื่อมต่อเครือข่าย</h1>
        <p>ดูเหมือนว่าคุณกำลังออฟไลน์อยู่ ข้อมูลที่คุณบันทึกไว้จะถูกซิงค์โดยอัตโนมัติเมื่อกลับมาออนไลน์</p>
        <button class="btn" onclick="window.location.reload()">ลองใหม่อีกครั้ง</button>
        <div class="status">
            <strong>สถานะ:</strong> รอการเชื่อมต่อ...
        </div>
    </div>
    <script>
        // Check connection periodically
        setInterval(() => {
            fetch('/').then(() => {
                window.location.reload();
            }).catch(() => {});
        }, 5000);

        // Listen for online event
        window.addEventListener('online', () => {
            window.location.reload();
        });
    </script>
</body>
</html>`;

    return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

/**
 * Create offline placeholder image
 */
function createOfflinePlaceholderImage() {
    // Simple 1x1 transparent PNG
    const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const binary = atob(png);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }

    return new Response(array, {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
    });
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);

    if (event.tag === 'idlpms-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * Perform background sync
 */
async function doBackgroundSync() {
    console.log('[SW] Performing background sync');

    try {
        // Notify clients to sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                timestamp: Date.now()
            });
        });

        return true;
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
        throw error; // Re-throw to retry
    }
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    let data = {
        title: 'IDLPMS',
        body: 'คุณมีการแจ้งเตือนใหม่',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        tag: 'idlpms-notification',
        data: {}
    };

    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag,
            data: data.data,
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'เปิดดู' },
                { action: 'dismiss', title: 'ปิด' }
            ]
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Open or focus the app
    event.waitUntil(
        (async () => {
            const clients = await self.clients.matchAll({ type: 'window' });

            // Focus existing window if available
            for (const client of clients) {
                if (client.url.includes('/index.html') && 'focus' in client) {
                    await client.focus();
                    client.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        data: event.notification.data
                    });
                    return;
                }
            }

            // Open new window
            if (self.clients.openWindow) {
                const url = event.notification.data?.url || '/index.html';
                await self.clients.openWindow(url);
            }
        })()
    );
});

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    const { type, payload } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CLEAR_CACHE':
            event.waitUntil(clearAllCaches());
            break;

        case 'CACHE_URLS':
            if (payload && Array.isArray(payload.urls)) {
                event.waitUntil(cacheUrls(payload.urls));
            }
            break;

        case 'GET_VERSION':
            event.ports[0]?.postMessage({ version: SW_VERSION });
            break;

        default:
            console.log('[SW] Unknown message type:', type);
    }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames
            .filter(name => name.startsWith(CACHE_PREFIX))
            .map(name => caches.delete(name))
    );
    console.log('[SW] All caches cleared');
}

/**
 * Cache specific URLs
 */
async function cacheUrls(urls) {
    const cache = await caches.open(CACHES.dynamic);
    await Promise.all(
        urls.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            } catch (error) {
                console.warn('[SW] Failed to cache URL:', url, error);
            }
        })
    );
    console.log('[SW] URLs cached:', urls.length);
}

// ============================================================================
// PERIODIC BACKGROUND SYNC (if supported)
// ============================================================================

self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync:', event.tag);

    if (event.tag === 'idlpms-periodic-sync') {
        event.waitUntil(doPeriodicSync());
    }
});

async function doPeriodicSync() {
    console.log('[SW] Performing periodic sync');

    // Update cached content
    const cache = await caches.open(CACHES.dynamic);

    // Re-cache critical pages
    const pagesToRefresh = [
        '/index.html',
        '/pages/home.html'
    ];

    await Promise.all(
        pagesToRefresh.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            } catch (error) {
                // Ignore errors during periodic sync
            }
        })
    );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a request should be cached
 */
function shouldCache(request, response) {
    // Don't cache non-GET requests
    if (request.method !== 'GET') return false;

    // Don't cache failed responses
    if (!response || !response.ok) return false;

    // Don't cache opaque responses (cross-origin without CORS)
    if (response.type === 'opaque') return false;

    return true;
}

/**
 * Get appropriate cache name for a request
 */
function getCacheNameForRequest(request) {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get('Accept') || '';

    if (acceptHeader.includes('image/') || /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url.pathname)) {
        return CACHES.images;
    }

    if (/\.(css|js|woff2?|ttf|otf|eot)$/i.test(url.pathname)) {
        return CACHES.static;
    }

    if (url.pathname.includes('/api/') || acceptHeader.includes('application/json')) {
        return CACHES.api;
    }

    return CACHES.dynamic;
}

console.log('[SW] Service Worker script loaded, version:', SW_VERSION);
