/**
 * IDLPMS SyncEngine - Background Sync Mechanism
 * ==============================================
 * Handles offline-to-online synchronization with:
 * - Automatic background sync when connection restored
 * - Conflict resolution strategies
 * - Retry logic with exponential backoff
 * - Event-driven status updates
 * - Service Worker integration ready
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const SyncEngineConfig = {
    // Sync intervals
    intervals: {
        online: 30 * 1000,       // 30 seconds when online
        retry: 5 * 1000,         // 5 seconds retry interval
        healthCheck: 60 * 1000   // 1 minute health check
    },

    // Retry settings
    retry: {
        maxAttempts: 5,
        baseDelay: 1000,
        maxDelay: 30 * 1000,
        backoffMultiplier: 2
    },

    // Batch settings
    batch: {
        maxSize: 50,            // Max operations per batch
        timeout: 30 * 1000      // 30 seconds timeout per batch
    },

    // Conflict resolution strategies
    conflictStrategy: {
        default: 'last-write-wins',    // 'last-write-wins' | 'server-wins' | 'client-wins' | 'manual'
        critical: 'manual'              // For critical data, require manual resolution
    },

    // Operation priorities (higher = sync first)
    priorities: {
        'createUser': 100,
        'createDelegation': 98,
        'removeDelegation': 97,
        'updateGrade': 95,
        'updateAttendance': 90,
        'addPassportRecord': 85,
        'addCredential': 85,
        'addIntelligenceSnapshot': 84,
        'updateUser': 80,
        'updateSchool': 70,
        'default': 50
    }
};

// ============================================================================
// SYNC STATUS ENUM
// ============================================================================

const SyncStatus = {
    IDLE: 'idle',
    SYNCING: 'syncing',
    PAUSED: 'paused',
    ERROR: 'error',
    OFFLINE: 'offline'
};

// ============================================================================
// SYNC ENGINE CLASS
// ============================================================================

class SyncEngine {
    constructor(config = {}) {
        this._config = { ...SyncEngineConfig, ...config };
        this._status = SyncStatus.IDLE;
        this._isOnline = navigator.onLine;
        this._syncInProgress = false;
        this._syncTimer = null;
        this._healthCheckTimer = null;
        this._listeners = new Map();
        this._conflictQueue = [];
        this._lastSyncTime = null;
        this._syncStats = {
            totalSynced: 0,
            totalFailed: 0,
            lastError: null
        };

        // Bind methods
        this._handleOnline = this._handleOnline.bind(this);
        this._handleOffline = this._handleOffline.bind(this);
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize the sync engine
     */
    async initialize() {
        // Set up online/offline listeners
        window.addEventListener('online', this._handleOnline);
        window.addEventListener('offline', this._handleOffline);

        // Update initial status
        this._isOnline = navigator.onLine;
        this._status = this._isOnline ? SyncStatus.IDLE : SyncStatus.OFFLINE;

        // Start health check
        this._startHealthCheck();

        // If online, start sync timer
        if (this._isOnline) {
            this._startSyncTimer();
        }

        console.log('[SyncEngine] Initialized', { isOnline: this._isOnline });
        this._emit('initialized', { isOnline: this._isOnline });
    }

    /**
     * Destroy the sync engine and clean up
     */
    destroy() {
        window.removeEventListener('online', this._handleOnline);
        window.removeEventListener('offline', this._handleOffline);
        this._stopSyncTimer();
        this._stopHealthCheck();
        this._listeners.clear();
        console.log('[SyncEngine] Destroyed');
    }

    // ========================================================================
    // ONLINE/OFFLINE HANDLERS
    // ========================================================================

    _handleOnline() {
        console.log('[SyncEngine] Connection restored');
        this._isOnline = true;
        this._status = SyncStatus.IDLE;
        this._emit('online');

        // Immediately attempt sync
        this.sync();

        // Restart sync timer
        this._startSyncTimer();
    }

    _handleOffline() {
        console.log('[SyncEngine] Connection lost');
        this._isOnline = false;
        this._status = SyncStatus.OFFLINE;
        this._emit('offline');

        // Stop sync timer
        this._stopSyncTimer();
    }

    // ========================================================================
    // SYNC OPERATIONS
    // ========================================================================

    /**
     * Perform synchronization
     * @param {object} options - Sync options
     */
    async sync(options = {}) {
        const { force = false } = options;

        // Check if can sync
        if (!this._isOnline) {
            console.log('[SyncEngine] Cannot sync - offline');
            return { success: false, reason: 'offline' };
        }

        if (this._syncInProgress && !force) {
            console.log('[SyncEngine] Sync already in progress');
            return { success: false, reason: 'in_progress' };
        }

        if (this._status === SyncStatus.PAUSED && !force) {
            console.log('[SyncEngine] Sync is paused');
            return { success: false, reason: 'paused' };
        }

        this._syncInProgress = true;
        this._status = SyncStatus.SYNCING;
        this._emit('syncStart');

        try {
            // Get cache service
            const cacheService = await this._getCacheService();

            // Get pending operations
            const pendingOps = await cacheService.getPendingOperations();

            if (pendingOps.length === 0) {
                console.log('[SyncEngine] No pending operations');
                this._syncInProgress = false;
                this._status = SyncStatus.IDLE;
                this._lastSyncTime = Date.now();
                this._emit('syncComplete', { synced: 0, failed: 0 });
                return { success: true, synced: 0, failed: 0 };
            }

            console.log(`[SyncEngine] Syncing ${pendingOps.length} operations`);

            // Sort by priority
            const sortedOps = this._sortByPriority(pendingOps);

            // Process in batches
            const results = await this._processBatches(sortedOps, cacheService);

            // Clean up completed operations
            await cacheService.clearCompletedOperations();

            this._lastSyncTime = Date.now();
            this._syncStats.totalSynced += results.synced;
            this._syncStats.totalFailed += results.failed;

            this._syncInProgress = false;
            this._status = results.failed > 0 ? SyncStatus.ERROR : SyncStatus.IDLE;

            this._emit('syncComplete', results);

            console.log(`[SyncEngine] Sync complete:`, results);
            return { success: true, ...results };

        } catch (error) {
            console.error('[SyncEngine] Sync failed:', error);
            this._syncInProgress = false;
            this._status = SyncStatus.ERROR;
            this._syncStats.lastError = error.message;
            this._emit('syncError', { error });
            return { success: false, error: error.message };
        }
    }

    /**
     * Sort operations by priority
     */
    _sortByPriority(operations) {
        return operations.sort((a, b) => {
            const priorityA = this._config.priorities[a.type] || this._config.priorities.default;
            const priorityB = this._config.priorities[b.type] || this._config.priorities.default;
            return priorityB - priorityA; // Higher priority first
        });
    }

    /**
     * Process operations in batches
     */
    async _processBatches(operations, cacheService) {
        const results = { synced: 0, failed: 0, conflicts: 0 };
        const batches = this._createBatches(operations);

        for (const batch of batches) {
            const batchResult = await this._processBatch(batch, cacheService);
            results.synced += batchResult.synced;
            results.failed += batchResult.failed;
            results.conflicts += batchResult.conflicts;

            // Emit progress
            this._emit('syncProgress', {
                processed: results.synced + results.failed,
                total: operations.length,
                ...results
            });
        }

        return results;
    }

    /**
     * Create batches from operations
     */
    _createBatches(operations) {
        const batches = [];
        for (let i = 0; i < operations.length; i += this._config.batch.maxSize) {
            batches.push(operations.slice(i, i + this._config.batch.maxSize));
        }
        return batches;
    }

    /**
     * Process a single batch
     */
    async _processBatch(batch, cacheService) {
        const results = { synced: 0, failed: 0, conflicts: 0 };

        // Process operations in parallel (within batch)
        const promises = batch.map(async (operation) => {
            try {
                const result = await this._processOperation(operation);

                if (result.success) {
                    await cacheService.markOperationCompleted(operation.id);
                    results.synced++;
                } else if (result.conflict) {
                    results.conflicts++;
                    await this._handleConflict(operation, result);
                } else {
                    await cacheService.markOperationFailed(operation.id, result.error);
                    results.failed++;
                }
            } catch (error) {
                await cacheService.markOperationFailed(operation.id, error.message);
                results.failed++;
            }
        });

        await Promise.all(promises);
        return results;
    }

    /**
     * Process a single operation with retry logic
     */
    async _processOperation(operation, attempt = 1) {
        try {
            const dataService = await this._getDataService();

            // Execute the operation based on type
            let result;
            switch (operation.type) {
                case 'updateUser':
                    result = await dataService.updateUser(operation.userId, operation.data);
                    break;
                case 'updateSchool':
                    result = await dataService.updateSchool(operation.schoolId, operation.data);
                    break;
                case 'createDelegation':
                    result = await dataService.addDelegation(
                        operation.delegatorId, operation.delegateeId,
                        operation.schoolId, operation.capabilityKey, operation.note
                    );
                    break;
                case 'removeDelegation':
                    result = await dataService.removeDelegation(operation.delegationId);
                    break;
                case 'addPassportRecord':
                    result = await dataService.addPassportRecord(operation.userId, operation.record);
                    break;
                case 'addCredential':
                    result = await dataService.addCredential(operation.personId, operation.credentialData, operation.creatorId);
                    break;
                case 'addIntelligenceSnapshot':
                    result = await dataService.addIntelligenceSnapshot(operation.personId, operation.kpaed, operation.creatorId, operation.source);
                    break;
                default:
                    console.warn(`[SyncEngine] Unknown operation type: ${operation.type}`);
                    return { success: false, error: 'Unknown operation type' };
            }

            return { success: true, result };

        } catch (error) {
            // Check if it's a conflict
            if (error.code === 'CONFLICT' || error.status === 409) {
                return { success: false, conflict: true, serverData: error.serverData };
            }

            // Retry logic
            if (attempt < this._config.retry.maxAttempts) {
                const delay = Math.min(
                    this._config.retry.baseDelay * Math.pow(this._config.retry.backoffMultiplier, attempt - 1),
                    this._config.retry.maxDelay
                );
                await this._sleep(delay);
                return this._processOperation(operation, attempt + 1);
            }

            return { success: false, error: error.message };
        }
    }

    // ========================================================================
    // CONFLICT RESOLUTION
    // ========================================================================

    /**
     * Handle a conflict
     */
    async _handleConflict(operation, result) {
        const strategy = operation.conflictStrategy ||
            this._config.conflictStrategy[operation.type] ||
            this._config.conflictStrategy.default;

        switch (strategy) {
            case 'last-write-wins':
                // Client data wins if newer
                if (operation.timestamp > (result.serverData?._lastModified || 0)) {
                    return this._forceSync(operation);
                }
                // Otherwise, server wins - discard client change
                return { resolved: true, winner: 'server' };

            case 'server-wins':
                // Discard client changes
                return { resolved: true, winner: 'server' };

            case 'client-wins':
                // Force push client changes
                return this._forceSync(operation);

            case 'manual':
            default:
                // Add to conflict queue for manual resolution
                this._conflictQueue.push({
                    operation,
                    serverData: result.serverData,
                    timestamp: Date.now()
                });
                this._emit('conflict', { operation, serverData: result.serverData });
                return { resolved: false, requiresManual: true };
        }
    }

    /**
     * Force sync an operation (override server)
     */
    async _forceSync(operation) {
        try {
            const dataService = await this._getDataService();
            // Add force flag to operation
            operation.data._forceOverwrite = true;
            await dataService.updateUser(operation.userId, operation.data);
            return { resolved: true, winner: 'client' };
        } catch (error) {
            return { resolved: false, error: error.message };
        }
    }

    /**
     * Get pending conflicts
     */
    getConflicts() {
        return [...this._conflictQueue];
    }

    /**
     * Resolve a conflict manually
     */
    async resolveConflict(conflictId, resolution) {
        const index = this._conflictQueue.findIndex(c => c.operation.id === conflictId);
        if (index === -1) {
            throw new Error('Conflict not found');
        }

        const conflict = this._conflictQueue[index];
        const cacheService = await this._getCacheService();

        if (resolution === 'keep-client') {
            await this._forceSync(conflict.operation);
            await cacheService.markOperationCompleted(conflict.operation.id);
        } else if (resolution === 'keep-server') {
            await cacheService.markOperationCompleted(conflict.operation.id);
        } else if (resolution === 'merge' && typeof resolution.mergedData === 'object') {
            conflict.operation.data = resolution.mergedData;
            await this._forceSync(conflict.operation);
            await cacheService.markOperationCompleted(conflict.operation.id);
        }

        this._conflictQueue.splice(index, 1);
        this._emit('conflictResolved', { conflictId, resolution });
    }

    // ========================================================================
    // QUEUE OPERATIONS
    // ========================================================================

    /**
     * Queue an operation for sync
     */
    async queueOperation(type, data) {
        const cacheService = await this._getCacheService();

        const operation = {
            type,
            ...data,
            timestamp: Date.now(),
            deviceId: this._getDeviceId()
        };

        const id = await cacheService.queueOperation(operation);

        this._emit('operationQueued', { id, type });

        // If online, trigger sync
        if (this._isOnline && !this._syncInProgress) {
            // Debounce to batch nearby operations
            this._scheduleSyncSoon();
        }

        return id;
    }

    /**
     * Schedule sync soon (with debounce)
     */
    _scheduleSyncSoon() {
        if (this._soonTimer) {
            clearTimeout(this._soonTimer);
        }
        this._soonTimer = setTimeout(() => {
            this.sync();
        }, 1000);
    }

    // ========================================================================
    // TIMERS
    // ========================================================================

    _startSyncTimer() {
        this._stopSyncTimer();
        this._syncTimer = setInterval(() => {
            if (this._isOnline && !this._syncInProgress) {
                this.sync();
            }
        }, this._config.intervals.online);
    }

    _stopSyncTimer() {
        if (this._syncTimer) {
            clearInterval(this._syncTimer);
            this._syncTimer = null;
        }
    }

    _startHealthCheck() {
        this._healthCheckTimer = setInterval(async () => {
            if (this._isOnline) {
                try {
                    const dataService = await this._getDataService();
                    const health = await dataService.healthCheck();
                    this._emit('healthCheck', health);
                } catch (error) {
                    this._emit('healthCheckFailed', { error: error.message });
                }
            }
        }, this._config.intervals.healthCheck);
    }

    _stopHealthCheck() {
        if (this._healthCheckTimer) {
            clearInterval(this._healthCheckTimer);
            this._healthCheckTimer = null;
        }
    }

    // ========================================================================
    // EVENT EMITTER
    // ========================================================================

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (!this._listeners.has(event)) return;
        const listeners = this._listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Emit event
     */
    _emit(event, data = {}) {
        if (!this._listeners.has(event)) return;
        this._listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[SyncEngine] Error in event listener for ${event}:`, error);
            }
        });
    }

    // ========================================================================
    // STATUS & STATS
    // ========================================================================

    /**
     * Get current sync status
     */
    getStatus() {
        return {
            status: this._status,
            isOnline: this._isOnline,
            syncInProgress: this._syncInProgress,
            lastSyncTime: this._lastSyncTime,
            conflictCount: this._conflictQueue.length,
            stats: { ...this._syncStats }
        };
    }

    /**
     * Pause syncing
     */
    pause() {
        this._status = SyncStatus.PAUSED;
        this._stopSyncTimer();
        this._emit('paused');
    }

    /**
     * Resume syncing
     */
    resume() {
        if (this._isOnline) {
            this._status = SyncStatus.IDLE;
            this._startSyncTimer();
            this.sync();
        } else {
            this._status = SyncStatus.OFFLINE;
        }
        this._emit('resumed');
    }

    /**
     * Force reset sync state
     */
    reset() {
        this._syncInProgress = false;
        this._conflictQueue = [];
        this._syncStats = {
            totalSynced: 0,
            totalFailed: 0,
            lastError: null
        };
        this._status = this._isOnline ? SyncStatus.IDLE : SyncStatus.OFFLINE;
        this._emit('reset');
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    async _getCacheService() {
        if (typeof getCacheService === 'function') {
            return getCacheService();
        }
        throw new Error('CacheService not available');
    }

    async _getDataService() {
        if (typeof DataServiceFactory !== 'undefined') {
            return DataServiceFactory.getInstance();
        }
        throw new Error('DataService not available');
    }

    _getDeviceId() {
        let deviceId = localStorage.getItem('idlpms_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('idlpms_device_id', deviceId);
        }
        return deviceId;
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _syncEngineInstance = null;

/**
 * Get or create the SyncEngine singleton
 */
async function getSyncEngine() {
    if (!_syncEngineInstance) {
        _syncEngineInstance = new SyncEngine();
        await _syncEngineInstance.initialize();
    }
    return _syncEngineInstance;
}

// ============================================================================
// SERVICE WORKER REGISTRATION HELPER
// ============================================================================

/**
 * Register background sync with Service Worker
 */
async function registerBackgroundSync(tag = 'idlpms-sync') {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log('[SyncEngine] Background sync registered:', tag);
            return true;
        } catch (error) {
            console.error('[SyncEngine] Background sync registration failed:', error);
            return false;
        }
    }
    return false;
}

// ============================================================================
// EXPORTS
// ============================================================================

// For browser
if (typeof window !== 'undefined') {
    window.SyncEngineConfig = SyncEngineConfig;
    window.SyncStatus = SyncStatus;
    window.SyncEngine = SyncEngine;
    window.getSyncEngine = getSyncEngine;
    window.registerBackgroundSync = registerBackgroundSync;
}

// For CommonJS/Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SyncEngineConfig,
        SyncStatus,
        SyncEngine,
        getSyncEngine,
        registerBackgroundSync
    };
}
