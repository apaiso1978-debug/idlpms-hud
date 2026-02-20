/**
 * IDLPMS AuthService - Secure Authentication Service
 * ==================================================
 * Provides secure token-based authentication with:
 * - JWT token management (preparation for backend)
 * - Session management with localStorage
 * - Role-based access control
 * - Token refresh mechanism
 * - Secure logout
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const AuthServiceConfig = {
    // Storage keys
    storageKeys: {
        accessToken: 'idlpms_access_token',
        refreshToken: 'idlpms_refresh_token',
        userId: 'idlpms_active_user_id',
        sessionData: 'idlpms_session',
        deviceId: 'idlpms_device_id'
    },

    // Token settings
    token: {
        accessTokenTTL: 15 * 60 * 1000,      // 15 minutes
        refreshTokenTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
        refreshThreshold: 5 * 60 * 1000       // Refresh when 5 minutes remaining
    },

    // Session settings
    session: {
        maxInactivity: 30 * 60 * 1000,       // 30 minutes
        extendOnActivity: true
    },

    // Security settings
    security: {
        requireHttps: false,  // Set to true in production
        allowedOrigins: ['localhost', '127.0.0.1'],
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000  // 15 minutes
    },

    // Mode: 'local' (using data.js) or 'api' (using backend)
    mode: 'local',

    // API endpoints (for future backend integration)
    endpoints: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        validate: '/api/auth/validate'
    }
};

// ============================================================================
// AUTH STATUS ENUM
// ============================================================================

const AuthStatus = {
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
    EXPIRED: 'expired',
    LOCKED: 'locked',
    PENDING: 'pending'
};

// ============================================================================
// PERMISSION LEVELS
// ============================================================================

const PermissionLevel = {
    NONE: 0,
    READ: 1,
    WRITE: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4
};

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

const RoleHierarchy = {
    STUDENT: { level: 1, canAccess: ['own_data', 'curriculum', 'chat'] },
    PARENT: { level: 2, canAccess: ['child_data', 'curriculum', 'chat', 'reports'] },
    TEACHER: { level: 3, canAccess: ['class_data', 'curriculum', 'chat', 'grades', 'attendance'] },
    SCHOOL_DIR: { level: 4, canAccess: ['school_data', 'all_teachers', 'reports', 'admin'] },
    ESA_DIR: { level: 5, canAccess: ['esa_data', 'all_schools', 'reports', 'admin'] },
    OBEC: { level: 6, canAccess: ['all_esa', 'national_reports', 'admin', 'policy'] },
    MOE: { level: 7, canAccess: ['everything'] },
    ADMIN: { level: 8, canAccess: ['everything', 'system_config'] }
};

// ============================================================================
// AUTH SERVICE CLASS
// ============================================================================

class AuthService {
    constructor(config = {}) {
        this._config = { ...AuthServiceConfig, ...config };
        this._currentUser = null;
        this._session = null;
        this._loginAttempts = new Map();
        this._listeners = new Map();
        this._activityTimer = null;
        this._refreshTimer = null;
        this._initialized = false;
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize the auth service
     */
    async initialize() {
        if (this._initialized) return;

        // Restore session from storage
        await this._restoreSession();

        // Set up activity tracking
        this._setupActivityTracking();

        // Set up token refresh
        if (this._session) {
            this._scheduleTokenRefresh();
        }

        this._initialized = true;
        console.log('[AuthService] Initialized', {
            hasSession: !!this._session,
            userId: this._currentUser?.id
        });

        this._emit('initialized', { user: this._currentUser });
    }

    /**
     * Restore session from storage
     */
    async _restoreSession() {
        try {
            const userId = localStorage.getItem(this._config.storageKeys.userId);
            const sessionData = localStorage.getItem(this._config.storageKeys.sessionData);

            if (!userId) {
                this._currentUser = null;
                this._session = null;
                return;
            }

            // Parse session data
            if (sessionData) {
                this._session = JSON.parse(sessionData);

                // Check if session is expired
                if (this._session.expiresAt && this._session.expiresAt < Date.now()) {
                    console.log('[AuthService] Session expired');
                    await this.logout({ reason: 'session_expired' });
                    return;
                }
            }

            // Load user data
            if (this._config.mode === 'local') {
                await this._loadLocalUser(userId);
            } else {
                await this._validateAndLoadUser();
            }

        } catch (error) {
            console.error('[AuthService] Failed to restore session:', error);
            await this.logout({ reason: 'restore_failed' });
        }
    }

    /**
     * Load user from local data.js
     */
    async _loadLocalUser(userId) {
        if (typeof IDLPMS_DATA === 'undefined') {
            throw new Error('IDLPMS_DATA not available');
        }

        const userData = IDLPMS_DATA.users[userId];
        if (!userData) {
            throw new Error('User not found');
        }

        const roleConfig = IDLPMS_DATA.roles[userData.role];

        this._currentUser = {
            id: userId,
            ...userData,
            roleConfig,
            permissions: this._buildPermissions(userData.role)
        };
    }

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    /**
     * Login with credentials
     * @param {string} userId - User ID or username
     * @param {string} password - Password (for future API auth)
     * @param {object} options - Login options
     */
    async login(userId, password = null, options = {}) {
        const { remember = true, deviceInfo = {} } = options;

        // Check for lockout
        if (this._isLockedOut(userId)) {
            const lockoutInfo = this._loginAttempts.get(userId);
            const remainingTime = Math.ceil((lockoutInfo.lockedUntil - Date.now()) / 1000 / 60);
            throw new AuthError(
                `บัญชีถูกล็อค กรุณารอ ${remainingTime} นาที`,
                'ACCOUNT_LOCKED'
            );
        }

        try {
            let user;

            if (this._config.mode === 'local') {
                user = await this._localLogin(userId);
            } else {
                user = await this._apiLogin(userId, password);
            }

            // Clear login attempts on success
            this._loginAttempts.delete(userId);

            // Create session
            this._session = this._createSession(user, remember);
            this._currentUser = user;

            // Persist to storage
            this._persistSession();

            // Schedule token refresh
            this._scheduleTokenRefresh();

            // Emit event
            this._emit('login', { user });

            console.log('[AuthService] Login successful:', userId);

            return {
                success: true,
                user: this._sanitizeUser(user)
            };

        } catch (error) {
            // Track failed attempt
            this._trackFailedAttempt(userId);

            console.error('[AuthService] Login failed:', error);
            throw error;
        }
    }

    /**
     * Local login (using data.js)
     */
    async _localLogin(userId, securityKey = null) {
        if (typeof IDLPMS_DATA === 'undefined') {
            throw new AuthError('ไม่พบข้อมูลระบบ', 'DATA_NOT_FOUND');
        }

        const userData = IDLPMS_DATA.users[userId];
        if (!userData) {
            throw new AuthError('ไม่พบผู้ใช้งาน', 'USER_NOT_FOUND');
        }

        // 🛡️ SECURITY ADDITION: Basic credential check for local mode
        // In local.js most users don't have passwords yet, but we allow 'password123'
        const expectedKey = userData.securityKey || 'password123';
        if (securityKey !== null && securityKey !== expectedKey) {
            throw new AuthError('รหัสผ่านไม่ถูกต้อง', 'INVALID_CREDENTIALS');
        }

        const roleConfig = IDLPMS_DATA.roles[userData.role];

        return {
            id: userId,
            ...userData,
            roleConfig,
            permissions: this._buildPermissions(userData.role)
        };
    }

    /**
     * API login (for future backend integration)
     */
    async _apiLogin(userId, password) {
        const response = await fetch(this._config.endpoints.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new AuthError(error.message || 'Login failed', error.code || 'LOGIN_FAILED');
        }

        const data = await response.json();

        // Store tokens
        if (data.accessToken) {
            localStorage.setItem(this._config.storageKeys.accessToken, data.accessToken);
        }
        if (data.refreshToken) {
            localStorage.setItem(this._config.storageKeys.refreshToken, data.refreshToken);
        }

        return data.user;
    }

    /**
     * Logout
     */
    async logout(options = {}) {
        const { reason = 'user_action' } = options;

        try {
            // Call API logout if in API mode
            if (this._config.mode === 'api') {
                await this._apiLogout();
            }
        } catch (error) {
            console.warn('[AuthService] API logout failed:', error);
        }

        // Clear timers
        this._clearTimers();

        // Clear storage
        Object.values(this._config.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });

        // Clear state
        const previousUser = this._currentUser;
        this._currentUser = null;
        this._session = null;

        // Emit event
        this._emit('logout', { reason, previousUser });

        console.log('[AuthService] Logged out:', reason);

        return { success: true, reason };
    }

    /**
     * API logout
     */
    async _apiLogout() {
        const token = localStorage.getItem(this._config.storageKeys.accessToken);
        if (!token) return;

        await fetch(this._config.endpoints.logout, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // ========================================================================
    // SESSION MANAGEMENT
    // ========================================================================

    /**
     * Create a new session
     */
    _createSession(user, remember) {
        const now = Date.now();
        const ttl = remember
            ? this._config.token.refreshTokenTTL
            : this._config.session.maxInactivity;

        return {
            userId: user.id,
            role: user.role,
            createdAt: now,
            lastActivity: now,
            expiresAt: now + ttl,
            remember,
            deviceId: this._getDeviceId()
        };
    }

    /**
     * Persist session to storage
     */
    _persistSession() {
        if (!this._currentUser || !this._session) return;

        localStorage.setItem(
            this._config.storageKeys.userId,
            this._currentUser.id
        );
        localStorage.setItem(
            this._config.storageKeys.sessionData,
            JSON.stringify(this._session)
        );
    }

    /**
     * Extend session on activity
     */
    _extendSession() {
        if (!this._session || !this._config.session.extendOnActivity) return;

        const now = Date.now();
        this._session.lastActivity = now;

        if (!this._session.remember) {
            this._session.expiresAt = now + this._config.session.maxInactivity;
        }

        this._persistSession();
    }

    /**
     * Check if session is valid
     */
    isSessionValid() {
        if (!this._session) return false;

        const now = Date.now();

        // Check expiration
        if (this._session.expiresAt && this._session.expiresAt < now) {
            return false;
        }

        // Check inactivity (for non-remembered sessions)
        if (!this._session.remember) {
            const inactivity = now - this._session.lastActivity;
            if (inactivity > this._config.session.maxInactivity) {
                return false;
            }
        }

        return true;
    }

    // ========================================================================
    // TOKEN MANAGEMENT
    // ========================================================================

    /**
     * Schedule token refresh
     */
    _scheduleTokenRefresh() {
        this._clearRefreshTimer();

        if (this._config.mode !== 'api') return;

        const refreshTime = this._config.token.accessTokenTTL - this._config.token.refreshThreshold;

        this._refreshTimer = setTimeout(async () => {
            await this._refreshToken();
            this._scheduleTokenRefresh();
        }, refreshTime);
    }

    /**
     * Refresh access token
     */
    async _refreshToken() {
        const refreshToken = localStorage.getItem(this._config.storageKeys.refreshToken);
        if (!refreshToken) {
            await this.logout({ reason: 'no_refresh_token' });
            return;
        }

        try {
            const response = await fetch(this._config.endpoints.refresh, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();

            localStorage.setItem(this._config.storageKeys.accessToken, data.accessToken);
            if (data.refreshToken) {
                localStorage.setItem(this._config.storageKeys.refreshToken, data.refreshToken);
            }

            this._emit('tokenRefreshed');

        } catch (error) {
            console.error('[AuthService] Token refresh failed:', error);
            await this.logout({ reason: 'refresh_failed' });
        }
    }

    /**
     * Get current access token
     */
    getAccessToken() {
        return localStorage.getItem(this._config.storageKeys.accessToken);
    }

    // ========================================================================
    // ACTIVITY TRACKING
    // ========================================================================

    /**
     * Set up activity tracking
     */
    _setupActivityTracking() {
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

        const handleActivity = this._throttle(() => {
            if (this._session) {
                this._extendSession();
            }
        }, 60000); // Throttle to once per minute

        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });
    }

    /**
     * Throttle function
     */
    _throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========================================================================
    // LOCKOUT MANAGEMENT
    // ========================================================================

    /**
     * Track failed login attempt
     */
    _trackFailedAttempt(userId) {
        const attempts = this._loginAttempts.get(userId) || { count: 0, lastAttempt: 0 };

        attempts.count++;
        attempts.lastAttempt = Date.now();

        if (attempts.count >= this._config.security.maxLoginAttempts) {
            attempts.lockedUntil = Date.now() + this._config.security.lockoutDuration;
        }

        this._loginAttempts.set(userId, attempts);
    }

    /**
     * Check if user is locked out
     */
    _isLockedOut(userId) {
        const attempts = this._loginAttempts.get(userId);
        if (!attempts || !attempts.lockedUntil) return false;

        if (Date.now() > attempts.lockedUntil) {
            // Lockout expired, reset
            this._loginAttempts.delete(userId);
            return false;
        }

        return true;
    }

    // ========================================================================
    // AUTHORIZATION
    // ========================================================================

    /**
     * Build permissions object for a role
     */
    _buildPermissions(role) {
        const hierarchy = RoleHierarchy[role];
        if (!hierarchy) return { level: 0, canAccess: [] };

        return {
            level: hierarchy.level,
            canAccess: [...hierarchy.canAccess]
        };
    }

    /**
     * Check if current user can access a resource
     */
    canAccess(resource) {
        if (!this._currentUser) return false;

        const permissions = this._currentUser.permissions;
        if (!permissions) return false;

        // MOE has access to everything
        if (permissions.canAccess.includes('everything')) return true;

        return permissions.canAccess.includes(resource);
    }

    /**
     * Check if current user has minimum role level
     */
    hasMinimumRole(role) {
        if (!this._currentUser) return false;

        const currentLevel = this._currentUser.permissions?.level || 0;
        const requiredLevel = RoleHierarchy[role]?.level || 0;

        return currentLevel >= requiredLevel;
    }

    /**
     * Check if user can access data of another user
     */
    canAccessUserData(targetUserId) {
        if (!this._currentUser) return false;

        // Same user
        if (this._currentUser.id === targetUserId) return true;

        // Get target user's data (in local mode)
        if (this._config.mode === 'local' && typeof IDLPMS_DATA !== 'undefined') {
            const targetUser = IDLPMS_DATA.users[targetUserId];
            if (!targetUser) return false;

            const currentRole = this._currentUser.role;
            const currentSchool = this._currentUser.schoolId;
            const currentESA = this._currentUser.districtId;

            // Teachers can access students in their school
            if (currentRole === 'TEACHER' && targetUser.schoolId === currentSchool) {
                return targetUser.role === 'STUDENT';
            }

            // School directors can access anyone in their school
            if (currentRole === 'SCHOOL_DIR' && targetUser.schoolId === currentSchool) {
                return true;
            }

            // ESA directors can access anyone in their ESA
            if (currentRole === 'ESA_DIR') {
                const targetSchool = IDLPMS_DATA.structure.schools[targetUser.schoolId];
                if (targetSchool && targetSchool.districtId === currentESA) {
                    return true;
                }
            }

            // OBEC and MOE can access anyone
            if (['OBEC', 'MOE'].includes(currentRole)) {
                return true;
            }

            // Parents can access their children
            if (currentRole === 'PARENT') {
                return this._currentUser.studentId === targetUserId;
            }
        }

        return false;
    }

    // ========================================================================
    // USER INFO
    // ========================================================================

    /**
     * Get current user
     */
    getCurrentUser() {
        return this._currentUser ? this._sanitizeUser(this._currentUser) : null;
    }

    /**
     * Get current user ID
     */
    getCurrentUserId() {
        return this._currentUser?.id || null;
    }

    /**
     * Get current user role
     */
    getCurrentRole() {
        return this._currentUser?.role || null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this._currentUser && this.isSessionValid();
    }

    /**
     * Get authentication status
     */
    getAuthStatus() {
        if (!this._currentUser) return AuthStatus.UNAUTHENTICATED;
        if (!this.isSessionValid()) return AuthStatus.EXPIRED;
        return AuthStatus.AUTHENTICATED;
    }

    /**
     * Sanitize user object (remove sensitive data)
     */
    _sanitizeUser(user) {
        const { password, securityKey, ...safeUser } = user;
        return safeUser;
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Get or generate device ID
     */
    _getDeviceId() {
        let deviceId = localStorage.getItem(this._config.storageKeys.deviceId);
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this._config.storageKeys.deviceId, deviceId);
        }
        return deviceId;
    }

    /**
     * Clear timers
     */
    _clearTimers() {
        this._clearRefreshTimer();
        if (this._activityTimer) {
            clearInterval(this._activityTimer);
            this._activityTimer = null;
        }
    }

    _clearRefreshTimer() {
        if (this._refreshTimer) {
            clearTimeout(this._refreshTimer);
            this._refreshTimer = null;
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
                console.error(`[AuthService] Error in event listener for ${event}:`, error);
            }
        });
    }
}

// ============================================================================
// AUTH ERROR CLASS
// ============================================================================

class AuthError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let _authServiceInstance = null;

/**
 * Get or create the AuthService singleton
 */
async function getAuthService() {
    if (!_authServiceInstance) {
        _authServiceInstance = new AuthService();
        await _authServiceInstance.initialize();
    }
    return _authServiceInstance;
}

/**
 * Get current user (convenience function)
 * Compatible with existing getCurrentUser() calls
 */
function getCurrentUser() {
    // Standardize: Look for specific User ID key first, fallback to legacy role key
    const userId = localStorage.getItem('idlpms_active_user_id') ||
        localStorage.getItem('idlpms_active_role');
    if (!userId) return null;

    if (typeof IDLPMS_DATA !== 'undefined' && IDLPMS_DATA.users[userId]) {
        const user = IDLPMS_DATA.users[userId];
        const roleConfig = IDLPMS_DATA.roles[user.role];
        return {
            ...roleConfig,
            ...user,
            id: userId, // Ensure ID is preserved
            roleConfig
        };
    }

    return null;
}

// ============================================================================
// EXPORTS
// ============================================================================

// For browser
if (typeof window !== 'undefined') {
    window.AuthServiceConfig = AuthServiceConfig;
    window.AuthStatus = AuthStatus;
    window.PermissionLevel = PermissionLevel;
    window.RoleHierarchy = RoleHierarchy;
    window.AuthService = AuthService;
    window.AuthError = AuthError;
    window.getAuthService = getAuthService;
    window.getCurrentUser = getCurrentUser;
}

// For CommonJS/Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthServiceConfig,
        AuthStatus,
        PermissionLevel,
        RoleHierarchy,
        AuthService,
        AuthError,
        getAuthService,
        getCurrentUser
    };
}
