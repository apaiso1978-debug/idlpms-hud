/**
 * IDLPMS AppBootstrap - Service Orchestrator
 * ==========================================
 * Manages the initialization sequence of all core services:
 * 1. DataService (Source of truth)
 * 2. AuthService (Session & Identity)
 * 3. CacheService (Storage buffer)
 * 4. SyncEngine (Background persistence)
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

class AppBootstrap {
    static _instance = null;

    constructor() {
        this.services = {
            data: null,
            auth: null,
            cache: null,
            sync: null
        };
        this.isReady = false;
        this._initPromise = null;
    }

    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!this._instance) {
            this._instance = new AppBootstrap();
        }
        return this._instance;
    }

    /**
     * Synchronize and initialize all services in correct order
     */
    async init() {
        if (this.isReady) return this.services;
        if (this._initPromise) return this._initPromise;

        console.group('[AppBootstrap] Initializing Services');

        this._initPromise = (async () => {
            try {
                // 1. Initialize DataService (Dependent for others)
                console.log('1/4 Initializing DataService...');
                this.services.data = await DataServiceFactory.getInstance();

                // 2. Initialize AuthService
                console.log('2/4 Initializing AuthService...');
                this.services.auth = new AuthService();
                await this.services.auth.initialize();

                // 3. Initialize CacheService
                console.log('3/4 Initializing CacheService...');
                if (typeof CacheService !== 'undefined') {
                    this.services.cache = new CacheService();
                    await this.services.cache.initialize();
                }

                // 4. Initialize SyncEngine
                console.log('4/4 Initializing SyncEngine...');
                if (typeof SyncEngine !== 'undefined') {
                    this.services.sync = new SyncEngine();
                    await this.services.sync.initialize();
                }

                this.isReady = true;
                console.log('[AppBootstrap] System Ready');
                console.groupEnd();

                return this.services;
            } catch (error) {
                console.error('[AppBootstrap] Initialization failed:', error);
                console.groupEnd();
                throw error;
            }
        })();

        return this._initPromise;
    }

    /**
     * Shorthand accessors
     */
    get data() { return this.services.data; }
    get auth() { return this.services.auth; }
    get cache() { return this.services.cache; }
    get sync() { return this.services.sync; }
}

// Global Export
if (typeof window !== 'undefined') {
    window.AppBootstrap = AppBootstrap;
    window.getApp = () => AppBootstrap.getInstance();
}
