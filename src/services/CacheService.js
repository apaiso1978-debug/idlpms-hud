/**
 * E-OS CacheService - IndexedDB Wrapper for Offline Support
 * ===========================================================
 * Provides persistent client-side caching using IndexedDB
 * Features:
 * - Automatic TTL (Time-To-Live) management
 * - Offline data storage
 * - Smart sync queue management
 * - Storage quota management
 *
 * @version 2.0.0
 * @author E-OS Development Team
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CacheServiceConfig = {
    dbName: 'EOS_Cache',
    dbVersion: 1,

    // Store names
    stores: {
        data: 'cached_data',
        syncQueue: 'sync_queue',
        metadata: 'cache_metadata'
    },

    // Default TTL values (in milliseconds)
    ttl: {
        user: 5 * 60 * 1000,           // 5 minutes
        school: 30 * 60 * 1000,        // 30 minutes
        curriculum: 24 * 60 * 60 * 1000, // 24 hours
        static: 7 * 24 * 60 * 60 * 1000, // 7 days
        default: 15 * 60 * 1000        // 15 minutes
    },

    // Storage limits
    limits: {
        maxItems: 5000,
        maxSyncQueueSize: 1000,
        cleanupThreshold: 0.9  // Clean when 90% full
    },

    // Category priorities (higher = more important, less likely to be evicted)
    priorities: {
        critical: 100,   // Never evict (user's own data)
        high: 75,        // Rarely evict (frequently accessed)
        medium: 50,      // Normal eviction
        low: 25          // First to evict
    }
};

// ============================================================================
// CACHE SERVICE CLASS
// ============================================================================

class CacheService {
    constructor(config = {}) {
        this._config = { ...CacheServiceConfig, ...config };
        this._db = null;
        this._initialized = false;
        this._memoryCache = new Map(); // Fast in-memory cache
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize the IndexedDB database
     */
    async initialize() {
        if (this._initialized) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(
                this._config.dbName,
                this._config.dbVersion
            );

            request.onerror = () => {
                console.error('[CacheService] Failed to open database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this._db = request.result;
                this._initialized = true;
                console.log('[CacheService] Database initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this._createStores(db);
            };
        });
    }

    /**
     * Create object stores
     */
    _createStores(db) {
        // Main data cache store
        if (!db.objectStoreNames.contains(this._config.stores.data)) {
            const dataStore = db.createObjectStore(this._config.stores.data, {
                keyPath: 'key'
            });
            dataStore.createIndex('category', 'category', { unique: false });
            dataStore.createIndex('expiresAt', 'expiresAt', { unique: false });
            dataStore.createIndex('priority', 'priority', { unique: false });
            dataStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }

        // Sync queue store for offline operations
        if (!db.objectStoreNames.contains(this._config.stores.syncQueue)) {
            const syncStore = db.createObjectStore(this._config.stores.syncQueue, {
                keyPath: 'id',
                autoIncrement: true
            });
            syncStore.createIndex('timestamp', 'timestamp', { unique: false });
            syncStore.createIndex('type', 'type', { unique: false });
            syncStore.createIndex('status', 'status', { unique: false });
        }

        // Metadata store
        if (!db.objectStoreNames.contains(this._config.stores.metadata)) {
            db.createObjectStore(this._config.stores.metadata, {
                keyPath: 'key'
            });
        }

        console.log('[CacheService] Object stores created');
    }

    /**
     * Ensure database is initialized
     */
    _ensureInitialized() {
        if (!this._initialized) {
            throw new Error('CacheService not initialized. Call initialize() first.');
        }
    }

    // ========================================================================
    // CORE CACHE OPERATIONS
    // ========================================================================

    /**
     * Get an item from cache
     * @param {string} key - Cache key
     * @param {boolean} updateAccess - Update last accessed time
     * @returns {any} Cached value or null
     */
    async get(key, updateAccess = true) {
        this._ensureInitialized();

        // Check memory cache first
        if (this._memoryCache.has(key)) {
            const memItem = this._memoryCache.get(key);
            if (memItem.expiresAt > Date.now()) {
                return memItem.value;
            }
            this._memoryCache.delete(key);
        }

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.data],
                updateAccess ? 'readwrite' : 'readonly'
            );
            const store = transaction.objectStore(this._config.stores.data);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const item = request.result;

                if (!item) {
                    resolve(null);
                    return;
                }

                // Check expiration
                if (item.expiresAt && item.expiresAt < Date.now()) {
                    // Item expired, delete it
                    store.delete(key);
                    resolve(null);
                    return;
                }

                // Update access time
                if (updateAccess) {
                    item.lastAccessed = Date.now();
                    item.accessCount = (item.accessCount || 0) + 1;
                    store.put(item);
                }

                // Store in memory cache
                this._memoryCache.set(key, {
                    value: item.value,
                    expiresAt: item.expiresAt
                });

                resolve(item.value);
            };
        });
    }

    /**
     * Set an item in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {object} options - Cache options
     */
    async set(key, value, options = {}) {
        this._ensureInitialized();

        const {
            category = 'default',
            ttl = this._config.ttl[category] || this._config.ttl.default,
            priority = this._config.priorities.medium
        } = options;

        const now = Date.now();
        const item = {
            key,
            value,
            category,
            priority,
            createdAt: now,
            lastAccessed: now,
            expiresAt: now + ttl,
            accessCount: 0
        };

        // Store in memory cache
        this._memoryCache.set(key, {
            value: item.value,
            expiresAt: item.expiresAt
        });

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.data],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.data);
            const request = store.put(item);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
        });
    }

    /**
     * Delete an item from cache
     * @param {string} key - Cache key
     */
    async delete(key) {
        this._ensureInitialized();

        this._memoryCache.delete(key);

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.data],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.data);
            const request = store.delete(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
        });
    }

    /**
     * Check if key exists in cache (and is not expired)
     * @param {string} key - Cache key
     */
    async has(key) {
        const value = await this.get(key, false);
        return value !== null;
    }

    /**
     * Get multiple items at once
     * @param {string[]} keys - Array of cache keys
     */
    async getMany(keys) {
        const results = {};
        await Promise.all(
            keys.map(async (key) => {
                results[key] = await this.get(key);
            })
        );
        return results;
    }

    /**
     * Set multiple items at once
     * @param {object} items - Object with key-value pairs
     * @param {object} options - Cache options (applied to all)
     */
    async setMany(items, options = {}) {
        await Promise.all(
            Object.entries(items).map(([key, value]) =>
                this.set(key, value, options)
            )
        );
    }

    // ========================================================================
    // CATEGORY-BASED OPERATIONS
    // ========================================================================

    /**
     * Get all items in a category
     * @param {string} category - Category name
     */
    async getByCategory(category) {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.data],
                'readonly'
            );
            const store = transaction.objectStore(this._config.stores.data);
            const index = store.index('category');
            const request = index.getAll(category);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const now = Date.now();
                const items = request.result
                    .filter(item => !item.expiresAt || item.expiresAt > now)
                    .map(item => ({ key: item.key, value: item.value }));
                resolve(items);
            };
        });
    }

    /**
     * Delete all items in a category
     * @param {string} category - Category name
     */
    async deleteByCategory(category) {
        this._ensureInitialized();

        const items = await this.getByCategory(category);
        await Promise.all(items.map(item => this.delete(item.key)));
        return items.length;
    }

    // ========================================================================
    // SYNC QUEUE OPERATIONS (For Offline Support)
    // ========================================================================

    /**
     * Add an operation to the sync queue
     * @param {object} operation - Operation to queue
     */
    async queueOperation(operation) {
        this._ensureInitialized();

        const queueItem = {
            ...operation,
            timestamp: Date.now(),
            status: 'pending',
            retryCount: 0
        };

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.syncQueue],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.syncQueue);
            const request = store.add(queueItem);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    /**
     * Get all pending operations from sync queue
     */
    async getPendingOperations() {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.syncQueue],
                'readonly'
            );
            const store = transaction.objectStore(this._config.stores.syncQueue);
            const index = store.index('status');
            const request = index.getAll('pending');

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                // Sort by timestamp (oldest first)
                const items = request.result.sort((a, b) => a.timestamp - b.timestamp);
                resolve(items);
            };
        });
    }

    /**
     * Mark an operation as completed
     * @param {number} id - Operation ID
     */
    async markOperationCompleted(id) {
        return this._updateOperationStatus(id, 'completed');
    }

    /**
     * Mark an operation as failed
     * @param {number} id - Operation ID
     * @param {string} error - Error message
     */
    async markOperationFailed(id, error) {
        return this._updateOperationStatus(id, 'failed', { error });
    }

    /**
     * Update operation status
     */
    async _updateOperationStatus(id, status, extra = {}) {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.syncQueue],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.syncQueue);
            const getRequest = store.get(id);

            getRequest.onerror = () => reject(getRequest.error);
            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (!item) {
                    resolve(false);
                    return;
                }

                item.status = status;
                item.updatedAt = Date.now();
                Object.assign(item, extra);

                if (status === 'failed') {
                    item.retryCount = (item.retryCount || 0) + 1;
                }

                const putRequest = store.put(item);
                putRequest.onerror = () => reject(putRequest.error);
                putRequest.onsuccess = () => resolve(true);
            };
        });
    }

    /**
     * Clear completed operations from sync queue
     */
    async clearCompletedOperations() {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.syncQueue],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.syncQueue);
            const index = store.index('status');
            const request = index.openCursor('completed');
            let count = 0;

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    count++;
                    cursor.continue();
                } else {
                    resolve(count);
                }
            };
        });
    }

    /**
     * Get sync queue statistics
     */
    async getSyncQueueStats() {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.syncQueue],
                'readonly'
            );
            const store = transaction.objectStore(this._config.stores.syncQueue);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const items = request.result;
                const stats = {
                    total: items.length,
                    pending: 0,
                    completed: 0,
                    failed: 0,
                    oldestPending: null
                };

                items.forEach(item => {
                    stats[item.status] = (stats[item.status] || 0) + 1;
                    if (item.status === 'pending') {
                        if (!stats.oldestPending || item.timestamp < stats.oldestPending) {
                            stats.oldestPending = item.timestamp;
                        }
                    }
                });

                resolve(stats);
            };
        });
    }

    // ========================================================================
    // MAINTENANCE OPERATIONS
    // ========================================================================

    /**
     * Clean expired items from cache
     */
    async cleanExpired() {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.data],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.data);
            const index = store.index('expiresAt');
            const now = Date.now();
            const range = IDBKeyRange.upperBound(now);
            const request = index.openCursor(range);
            let count = 0;

            request.onerror = () => reject(request.error);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    this._memoryCache.delete(cursor.value.key);
                    count++;
                    cursor.continue();
                } else {
                    console.log(`[CacheService] Cleaned ${count} expired items`);
                    resolve(count);
                }
            };
        });
    }

    /**
     * Evict items based on LRU (Least Recently Used) policy
     * @param {number} targetCount - Target number of items to keep
     */
    async evictLRU(targetCount) {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.data],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.data);
            const index = store.index('lastAccessed');
            const request = index.openCursor();

            let currentCount = 0;
            const toDelete = [];

            // First pass: count and identify items to delete
            const countRequest = store.count();
            countRequest.onsuccess = () => {
                const totalCount = countRequest.result;
                if (totalCount <= targetCount) {
                    resolve(0);
                    return;
                }

                const deleteCount = totalCount - targetCount;

                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && toDelete.length < deleteCount) {
                        const item = cursor.value;
                        // Don't evict critical priority items
                        if (item.priority < this._config.priorities.critical) {
                            toDelete.push(item.key);
                        }
                        cursor.continue();
                    } else {
                        // Delete identified items
                        toDelete.forEach(key => {
                            store.delete(key);
                            this._memoryCache.delete(key);
                        });
                        console.log(`[CacheService] Evicted ${toDelete.length} items (LRU)`);
                        resolve(toDelete.length);
                    }
                };
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get cache statistics
     */
    async getStats() {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.data, this._config.stores.syncQueue],
                'readonly'
            );

            const dataStore = transaction.objectStore(this._config.stores.data);
            const syncStore = transaction.objectStore(this._config.stores.syncQueue);

            const stats = {
                dataItems: 0,
                syncQueueItems: 0,
                memoryItems: this._memoryCache.size,
                categories: {},
                estimatedSize: 0
            };

            const dataRequest = dataStore.getAll();
            dataRequest.onsuccess = () => {
                const items = dataRequest.result;
                stats.dataItems = items.length;

                items.forEach(item => {
                    const cat = item.category || 'default';
                    stats.categories[cat] = (stats.categories[cat] || 0) + 1;
                    stats.estimatedSize += JSON.stringify(item).length;
                });

                const syncRequest = syncStore.count();
                syncRequest.onsuccess = () => {
                    stats.syncQueueItems = syncRequest.result;
                    resolve(stats);
                };
            };

            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Clear all cached data
     */
    async clearAll() {
        this._ensureInitialized();
        this._memoryCache.clear();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.data],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.data);
            const request = store.clear();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                console.log('[CacheService] All cache data cleared');
                resolve(true);
            };
        });
    }

    /**
     * Clear memory cache only
     */
    clearMemoryCache() {
        this._memoryCache.clear();
    }

    // ========================================================================
    // METADATA OPERATIONS
    // ========================================================================

    /**
     * Set metadata value
     * @param {string} key - Metadata key
     * @param {any} value - Metadata value
     */
    async setMetadata(key, value) {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.metadata],
                'readwrite'
            );
            const store = transaction.objectStore(this._config.stores.metadata);
            const request = store.put({ key, value, updatedAt: Date.now() });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
        });
    }

    /**
     * Get metadata value
     * @param {string} key - Metadata key
     */
    async getMetadata(key) {
        this._ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this._db.transaction(
                [this._config.stores.metadata],
                'readonly'
            );
            const store = transaction.objectStore(this._config.stores.metadata);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
        });
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Generate a cache key
     * @param {string} prefix - Key prefix
     * @param  {...any} parts - Key parts
     */
    static generateKey(prefix, ...parts) {
        return `${prefix}:${parts.join(':')}`;
    }

    /**
     * Check if IndexedDB is supported
     */
    static isSupported() {
        return typeof indexedDB !== 'undefined';
    }

    /**
     * Close the database connection
     */
    close() {
        if (this._db) {
            this._db.close();
            this._db = null;
            this._initialized = false;
        }
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _cacheServiceInstance = null;

/**
 * Get or create the CacheService singleton
 */
async function getCacheService() {
    if (!_cacheServiceInstance) {
        _cacheServiceInstance = new CacheService();
        await _cacheServiceInstance.initialize();
    }
    return _cacheServiceInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

// For browser
if (typeof window !== 'undefined') {
    window.CacheServiceConfig = CacheServiceConfig;
    window.CacheService = CacheService;
    window.getCacheService = getCacheService;
}

// For CommonJS/Node.js (testing with fake-indexeddb)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CacheServiceConfig,
        CacheService,
        getCacheService
    };
}
