/**
 * IDLPMS DataService - Abstract Data Access Layer
 * ================================================
 * Provides unified interface for data operations supporting:
 * - Local static data (data.js) for development/testing
 * - Google Apps Script for production with sharding
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DataServiceConfig = {
    // Current mode: 'local' | 'appsscript' | 'insforge'
    mode: 'insforge',

    // InsForge settings (local/cloud)
    insforge: {
        baseUrl: 'https://3tcdq2dd.ap-southeast.insforge.app',
        apiKey: 'ik_e9ac09dcf4f6732689dd5558fe889c0a',
        adminEmail: 'Apaiso1978@gmail.com',
        adminPassword: 'Yuri@04032526'
    },

    // Transfer Escalation Rules (Unity: applies to ALL roles)
    transferEscalation: {
        thresholds: [
            { days: 30, level: 'SCHOOL', status: 'AT_RISK', icon: 'i-exclamation-triangle', notify: ['SCHOOL_DIR'] },
            { days: 60, level: 'ESA', status: 'CRITICAL', icon: 'i-x-circle', notify: ['SCHOOL_DIR', 'ESA_DIR'] },
            { days: 90, level: 'OBEC', status: 'DROPOUT', icon: 'i-bell-alert', notify: ['SCHOOL_DIR', 'ESA_DIR', 'OBEC'] },
        ],
        checkIntervalHours: 24,  // ตรวจทุก 24 ชม.
        initialStatus: 'PENDING_TRANSFER',
    },

    // Apps Script endpoints (for future use)
    endpoints: {
        master: '', // Master router URL
        shards: {}  // ESA-specific endpoints
    },

    // Cache settings
    cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
        maxItems: 1000
    },

    // Retry settings
    retry: {
        maxAttempts: 3,
        delay: 1000,
        backoffMultiplier: 2
    }
};

// ============================================================================
// ABSTRACT DATA SERVICE INTERFACE
// ============================================================================

/**
 * Abstract DataService class - defines the contract for all implementations
 */
class AbstractDataService {
    constructor() {
        if (this.constructor === AbstractDataService) {
            throw new Error('AbstractDataService cannot be instantiated directly');
        }
    }

    // ----- User Operations -----
    async getUser(userId) { throw new Error('Method not implemented'); }
    async getUsersByRole(role) { throw new Error('Method not implemented'); }
    async getUsersBySchool(schoolId) { throw new Error('Method not implemented'); }
    async getUsersByESA(esaId) { throw new new Error('Method not implemented'); }
    async updateUser(userId, data) { throw new Error('Method not implemented'); }

    // ----- School Operations -----
    async getSchool(schoolId) { throw new Error('Method not implemented'); }
    async getSchoolsByESA(esaId) { throw new Error('Method not implemented'); }
    async updateSchool(schoolId, data) {
        throw new Error('Not implemented');
    }

    /**
     * Unified Person Creation (Student/Teacher/Director)
     * Maps form data (snake_case) to model (camelCase) and persists.
     * @param {string} role - STUDENT, TEACHER, or SCHOOL_DIR
     * @param {object} rawData - Data from input forms
     * @returns {Promise<object>} - Created user object
     */
    async createPerson(role, rawData) {
        throw new Error('Not implemented');
    }
    // ----- ESA/District Operations -----
    async getESA(esaId) { throw new Error('Method not implemented'); }
    async getAllESAs() { throw new Error('Method not implemented'); }

    // ----- Curriculum Operations -----
    async getSubject(subjectId) { throw new Error('Method not implemented'); }
    async getAllSubjects() { throw new Error('Method not implemented'); }
    async getSubjectUnits(subjectId) { throw new Error('Method not implemented'); }

    // ----- Role/Permission Operations -----
    async getRoleConfig(roleId) { throw new Error('Method not implemented'); }
    async getAllRoles() { throw new Error('Method not implemented'); }

    // ----- Group Operations -----
    async getGroup(groupId) { throw new Error('Method not implemented'); }
    async getGroupsByUser(userId) { throw new Error('Method not implemented'); }

    // ----- Statistics -----
    async getGlobalStats() { throw new Error('Method not implemented'); }
    async getSchoolStats(schoolId) { throw new Error('Method not implemented'); }
    async getESAStats(esaId) { throw new Error('Method not implemented'); }

    // ----- Utility -----
    async healthCheck() { throw new Error('Method not implemented'); }
    async sync() { throw new Error('Method not implemented'); }

    // ----- Delegation Operations (DMDP) -----
    async getDelegations(personId, schoolId) { throw new Error('Method not implemented'); }
    async createDelegation(data) { throw new Error('Method not implemented'); }
    async getSubordinates(userId, role) { throw new Error('Method not implemented'); }

    // ----- Passport Operations -----
    async addPassportRecord(userId, record) { throw new Error('Method not implemented'); }
    async getPassport(userId) { throw new Error('Method not implemented'); }
}

// ============================================================================
// LOCAL DATA SERVICE (Using data.js)
// ============================================================================

/**
 * LocalDataService - Implementation using static data.js
 * Used for local development and testing
 */
class LocalDataService extends AbstractDataService {
    constructor() {
        super();
        this._data = null;
        this._initialized = false;
    }

    /**
     * Initialize the service by loading data from IDLPMS_DATA or LocalStorage
     */
    async initialize() {
        if (this._initialized) return;

        // Check if IDLPMS_DATA is available (from data.js)
        if (typeof IDLPMS_DATA === 'undefined') {
            throw new Error('IDLPMS_DATA not found. Make sure data.js is loaded.');
        }

        // 🧬 SHADOW PERSISTENCE: Try to load from LocalStorage first
        const savedData = localStorage.getItem('idlpms_dynamic_data');
        if (savedData) {
            try {
                this._data = JSON.parse(savedData);
                console.log('[LocalDataService] Initialized with PERSISTED dynamic data');
            } catch (e) {
                console.warn('[LocalDataService] Failed to parse saved data, falling back to static mocks');
                this._data = IDLPMS_DATA;
            }
        } else {
            this._data = IDLPMS_DATA;
            console.log('[LocalDataService] Initialized with STATIC data');
        }

        this._initialized = true;
    }

    /**
     * Persist current state to LocalStorage
     */
    _persist() {
        if (!this._data) return;
        try {
            localStorage.setItem('idlpms_dynamic_data', JSON.stringify(this._data));
        } catch (e) {
            console.error('[LocalDataService] Persistence failed:', e);
        }
    }

    /**
     * Reset local data to factory settings
     */
    async resetToDefault() {
        localStorage.removeItem('idlpms_dynamic_data');
        this._data = IDLPMS_DATA;
        this._persist();
        window.location.reload();
    }

    _ensureInitialized() {
        if (!this._initialized) {
            throw new Error('LocalDataService not initialized. Call initialize() first.');
        }
    }

    // ----- User Operations -----

    async getUser(userId) {
        this._ensureInitialized();
        const user = this._data.users[userId];
        if (!user) return null;

        // Enrich with role config
        const roleConfig = this._data.roles[user.role];
        return {
            id: userId,
            ...user,
            roleConfig
        };
    }

    async getUsersByRole(role) {
        this._ensureInitialized();
        const users = [];
        for (const [id, user] of Object.entries(this._data.users)) {
            if (user.role === role) {
                users.push({ id, ...user });
            }
        }
        return users;
    }

    async getUsersBySchool(schoolId) {
        this._ensureInitialized();
        const users = [];
        for (const [id, user] of Object.entries(this._data.users)) {
            if (user.schoolId === schoolId) {
                users.push({ id, ...user });
            }
        }
        return users;
    }

    async getUsersByESA(esaId) {
        this._ensureInitialized();
        const users = [];

        // Get schools in this ESA
        const schools = await this.getSchoolsByESA(esaId);
        const schoolIds = schools.map(s => s.id);

        for (const [id, user] of Object.entries(this._data.users)) {
            if (schoolIds.includes(user.schoolId) || user.districtId === esaId) {
                users.push({ id, ...user });
            }
        }
        return users;
    }

    // ----- Dynamic Teacher CRUD -----

    async createTeacher(data) {
        this._ensureInitialized();
        const teacherId = 'TEA_' + Date.now();
        const newTeacher = {
            role: 'TEACHER',
            password: 'password123', // Default
            canTeachSubjects: [],
            maxPeriodsPerWeek: 35,
            maxPeriodsPerDay: 7,
            status: 'ACTIVE',
            ...data,
            _created: Date.now()
        };

        this._data.users[teacherId] = newTeacher;
        this._persist();
        return { id: teacherId, ...newTeacher };
    }

    async deleteTeacher(teacherId) {
        this._ensureInitialized();
        if (this._data.users[teacherId]) {
            delete this._data.users[teacherId];
            this._persist();
            return true;
        }
        return false;
    }

    async updateUser(userId, data) {
        this._ensureInitialized();
        if (!this._data.users[userId]) {
            throw new Error(`User ${userId} not found`);
        }

        // Merge data (in local mode, this is temporary)
        this._data.users[userId] = {
            ...this._data.users[userId],
            ...data,
            _lastModified: Date.now()
        };

        this._persist(); // 🧬 Persist changes
        return this._data.users[userId];
    }

    // ----- School Operations -----

    async getSchool(schoolId) {
        this._ensureInitialized();
        const school = this._data.structure.schools[schoolId];
        if (!school) return null;
        return { id: schoolId, ...school };
    }

    async getSchoolsByESA(esaId) {
        this._ensureInitialized();
        const schools = [];
        for (const [id, school] of Object.entries(this._data.structure.schools)) {
            if (school.districtId === esaId) {
                schools.push({ id, ...school });
            }
        }
        return schools;
    }

    async updateSchool(schoolId, data) {
        this._ensureInitialized();
        if (!this._data.structure.schools[schoolId]) {
            throw new Error(`School ${schoolId} not found`);
        }

        this._data.structure.schools[schoolId] = {
            ...this._data.structure.schools[schoolId],
            ...data,
            _lastModified: Date.now()
        };

        this._persist(); // 🧬 Persist changes
        return this._data.structure.schools[schoolId];
    }

    async createPerson(role, rawData) {
        this._ensureInitialized();

        const timestamp = Date.now();
        const idPrefix = {
            'STUDENT': 'STU_',
            'TEACHER': 'TEA_',
            'SCHOOL_DIR': 'DIR_'
        }[role] || 'USR_';

        const userId = idPrefix + timestamp;

        // Unified Mapping: Formalizing the "Bridge" between snake_case forms and camelCase models
        const newUser = {
            id: userId,
            role: role,
            status: 'ACTIVE',
            fullName: rawData.fullName ||
                (rawData.first_name_th && rawData.last_name_th
                    ? `${rawData.prefix_th || ''}${rawData.first_name_th} ${rawData.last_name_th}`.trim()
                    : rawData.name || 'Anonymous User'),
            citizenId: rawData.citizenId || rawData.id_number || '',
            birthDate: rawData.birthDate || rawData.birth_date || null,
            email: rawData.email || `${userId.toLowerCase()}@idlpms.moe.go.th`,
            phone: rawData.phone || '',
            address: rawData.address || rawData.reg_house || '',
            schoolId: rawData.schoolId || 'SCH_MABLUD',
            classId: rawData.classId || rawData.grade_level || '',
            password: 'password123', // Default
            _created: timestamp,
            _lastModified: timestamp,
            ...rawData // Keep original fields for backward compat
        };

        this._data.users[userId] = newUser;
        this._persist();

        console.info(`[LocalDataService] Created ${role}: ${newUser.fullName} (${userId})`);
        return newUser;
    }
    // ----- ESA/District Operations -----

    async getESA(esaId) {
        this._ensureInitialized();
        const esa = this._data.structure.districts[esaId];
        if (!esa) return null;
        return { id: esaId, ...esa };
    }

    async getAllESAs() {
        this._ensureInitialized();
        const esas = [];
        for (const [id, esa] of Object.entries(this._data.structure.districts)) {
            esas.push({ id, ...esa });
        }
        return esas;
    }

    // ----- Curriculum Operations -----

    async getSubject(subjectId) {
        this._ensureInitialized();
        const subject = this._data.curriculum[subjectId];
        if (!subject) return null;
        return { id: subjectId, ...subject };
    }

    async getAllSubjects() {
        this._ensureInitialized();
        const subjects = [];
        for (const [id, subject] of Object.entries(this._data.curriculum)) {
            subjects.push({ id, ...subject });
        }
        return subjects;
    }

    async getSubjectUnits(subjectId) {
        this._ensureInitialized();
        const subject = this._data.curriculum[subjectId];
        if (!subject) return [];
        return subject.units || [];
    }

    // ----- Role/Permission Operations -----

    async getRoleConfig(roleId) {
        this._ensureInitialized();
        const role = this._data.roles[roleId];
        if (!role) return null;
        return { id: roleId, ...role };
    }

    async getAllRoles() {
        this._ensureInitialized();
        const roles = [];
        for (const [id, role] of Object.entries(this._data.roles)) {
            roles.push({ id, ...role });
        }
        return roles;
    }

    // ----- Group Operations -----

    async getGroup(groupId) {
        this._ensureInitialized();
        const group = this._data.groups[groupId];
        if (!group) return null;
        return { id: groupId, ...group };
    }

    async getGroupsByUser(userId) {
        this._ensureInitialized();
        const groups = [];
        for (const [id, group] of Object.entries(this._data.groups)) {
            if (group.members && group.members.includes(userId)) {
                groups.push({ id, ...group });
            }
        }
        return groups;
    }

    // ----- Statistics -----

    async getGlobalStats() {
        this._ensureInitialized();
        return this._data.stats?.global || {
            totalStudents: 0,
            totalSchools: 0,
            activeUsers: 0
        };
    }

    async getSchoolStats(schoolId) {
        this._ensureInitialized();
        // For local mode, return mock stats
        return {
            schoolId,
            ...this._data.stats?.school,
            studentCount: (await this.getUsersBySchool(schoolId))
                .filter(u => u.role === 'STUDENT').length,
            teacherCount: (await this.getUsersBySchool(schoolId))
                .filter(u => u.role === 'TEACHER').length
        };
    }

    async getESAStats(esaId) {
        this._ensureInitialized();
        const schools = await this.getSchoolsByESA(esaId);
        const users = await this.getUsersByESA(esaId);

        return {
            esaId,
            schoolCount: schools.length,
            studentCount: users.filter(u => u.role === 'STUDENT').length,
            teacherCount: users.filter(u => u.role === 'TEACHER').length,
            totalUsers: users.length
        };
    }

    // ----- Utility -----

    async healthCheck() {
        try {
            this._ensureInitialized();
            return {
                status: 'healthy',
                mode: 'local',
                timestamp: Date.now(),
                dataLoaded: !!this._data
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                mode: 'local',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    async sync() {
        // Local mode doesn't need sync
        console.log('[LocalDataService] Sync not required for local mode');
        return { synced: false, reason: 'local_mode' };
    }

    // ----- Delegation Operations (DMDP) -----

    /**
     * Get viable delegation targets based on hierarchy
     */
    async getSubordinates(userId, role) {
        this._ensureInitialized();
        const user = await this.getUser(userId);
        if (!user) return [];

        const allUsers = Object.entries(this._data.users).map(([id, u]) => ({ id, ...u }));

        switch (role) {
            case 'OBEC':
            case 'MOE':
                // OBEC/MOE can delegate to ESA Directors
                return allUsers.filter(u => u.role === 'ESA_DIR');

            case 'ESA_DIR':
                // ESA Dir can delegate to School Directors in their district
                return allUsers.filter(u => u.role === 'SCHOOL_DIR' && u.districtId === user.districtId);

            case 'SCHOOL_DIR':
                // School Dir can delegate to Teachers in their school
                return allUsers.filter(u => u.role === 'TEACHER' && u.schoolId === user.schoolId);

            case 'TEACHER':
                // Teachers can delegate to Students in their class
                // Note: Students don't delegate (per instructions)
                return allUsers.filter(u => u.role === 'STUDENT' && u.classId === user.classId);

            default:
                return [];
        }
    }

    /**
     * Persist a new delegation mission
     */
    async createDelegation(data) {
        this._ensureInitialized();
        const delegationId = 'DEL_' + Date.now();
        const newDelegation = {
            id: delegationId,
            status: 'PENDING',
            created_at: new Date().toISOString(),
            ...data
        };

        if (!this._data.delegations) this._data.delegations = [];
        this._data.delegations.push(newDelegation);

        // 🧬 Passport Integration: Write to recipient's passport
        await this.addPassportRecord(data.delegatee_id, {
            type: 'MISSION',
            missionId: delegationId,
            title: data.moduleTitle || 'ภารกิจมอบหมาย',
            note: data.note || '',
            delegatorId: data.delegator_id,
            timestamp: newDelegation.created_at
        });

        this._persist();
        return newDelegation;
    }

    /**
     * Get delegations involving this user
     */
    async getDelegations(personId, schoolId) {
        this._ensureInitialized();
        const delegations = this._data.delegations || [];

        // Return both Dispatched and Inbox for Dashboard visibility
        return delegations.filter(d =>
            d.delegatee_id === personId || d.delegator_id === personId
        );
    }

    // ----- Passport Operations -----

    async addPassportRecord(userId, record) {
        this._ensureInitialized();
        if (!this._data.passports) this._data.passports = {};
        if (!this._data.passports[userId]) this._data.passports[userId] = [];

        const newRecord = {
            id: 'REC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            ...record
        };

        this._data.passports[userId].push(newRecord);
        this._persist();
        return newRecord;
    }

    async getPassport(userId) {
        this._ensureInitialized();
        return this._data.passports?.[userId] || [];
    }

    /**
     * Transfer Timeout Escalation — Auto-notification ตามลำดับขั้น
     * Unity: ใช้กับทุก Role (นักเรียน, ครู, ผอ.)
     * Flow: PENDING_TRANSFER → AT_RISK (30d) → CRITICAL (60d) → DROPOUT (90d)
     * Notifications: School → ESA → OBEC (auto-escalate)
     */
    getTransferAlerts(schoolId) {
        this._ensureInitialized();
        const users = window.IDLPMS_DATA?.users || {};
        const rules = DataServiceConfig.transferEscalation.thresholds;
        const today = new Date();
        const alerts = [];

        for (const [uid, user] of Object.entries(users)) {
            if (user.status !== 'PENDING_TRANSFER' || !user.transferDate) continue;
            if (schoolId && user.schoolId !== schoolId) continue;

            // Parse Thai Buddhist year date (2568-11-07 → 2025-11-07)
            const parts = user.transferDate.split('-');
            const gregYear = parseInt(parts[0]) - 543;
            const transferDate = new Date(`${gregYear}-${parts[1]}-${parts[2]}`);
            const daysElapsed = Math.floor((today - transferDate) / (1000 * 60 * 60 * 24));

            // Find highest matching threshold
            let matchedRule = null;
            for (const rule of rules) {
                if (daysElapsed >= rule.days) matchedRule = rule;
            }

            if (matchedRule) {
                alerts.push({
                    userId: uid,
                    fullName: user.fullName,
                    role: user.role,
                    classId: user.classId || null,
                    schoolId: user.schoolId,
                    transferDate: user.transferDate,
                    daysElapsed,
                    alertLevel: matchedRule.level,
                    alertStatus: matchedRule.status,
                    icon: matchedRule.icon,
                    notifyTargets: matchedRule.notify,
                });
            }
        }

        return alerts.sort((a, b) => b.daysElapsed - a.daysElapsed);
    }
}

// ============================================================================
// APPS SCRIPT DATA SERVICE (For Production)
// ============================================================================

/**
 * AppsScriptDataService - Implementation using Google Apps Script
 * Supports sharding by ESA for scalability
 */
class AppsScriptDataService extends AbstractDataService {
    constructor(config = {}) {
        super();
        this._config = { ...DataServiceConfig, ...config };
        this._cache = new Map();
        this._pendingSync = [];
        this._initialized = false;
    }

    /**
     * Initialize the service
     */
    async initialize() {
        if (this._initialized) return;

        // Validate configuration
        if (!this._config.endpoints.master) {
            throw new Error('Master endpoint URL is required for AppsScriptDataService');
        }

        // Test connection to master
        const health = await this._callMaster('healthCheck');
        if (health.status !== 'healthy') {
            throw new Error('Failed to connect to Apps Script master');
        }

        // Load shard routing table
        this._shardRoutes = await this._callMaster('getShardRoutes');

        this._initialized = true;
        console.log('[AppsScriptDataService] Initialized with Apps Script backend');
    }

    /**
     * Call the master router
     */
    async _callMaster(action, params = {}) {
        return this._callEndpoint(this._config.endpoints.master, action, params);
    }

    /**
     * Call a specific shard based on ESA ID
     */
    async _callShard(esaId, action, params = {}) {
        const shardUrl = this._getShardUrl(esaId);
        return this._callEndpoint(shardUrl, action, params);
    }

    /**
     * Get shard URL for an ESA
     */
    _getShardUrl(esaId) {
        if (this._shardRoutes && this._shardRoutes[esaId]) {
            return this._shardRoutes[esaId];
        }
        // Fallback to master
        return this._config.endpoints.master;
    }

    /**
     * Call an Apps Script endpoint with retry logic
     */
    async _callEndpoint(url, action, params = {}, attempt = 1) {
        const cacheKey = `${url}:${action}:${JSON.stringify(params)}`;

        // Check cache for read operations
        if (this._isReadOperation(action) && this._cache.has(cacheKey)) {
            const cached = this._cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this._config.cache.ttl) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    params,
                    timestamp: Date.now()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            // Cache successful read results
            if (this._isReadOperation(action)) {
                this._cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }

            return result;

        } catch (error) {
            // Retry logic
            if (attempt < this._config.retry.maxAttempts) {
                const delay = this._config.retry.delay *
                    Math.pow(this._config.retry.backoffMultiplier, attempt - 1);
                await this._sleep(delay);
                return this._callEndpoint(url, action, params, attempt + 1);
            }

            throw error;
        }
    }

    _isReadOperation(action) {
        return action.startsWith('get') || action.startsWith('list') || action === 'healthCheck';
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ----- User Operations -----

    async getUser(userId) {
        // Determine which shard to query based on user's ESA
        const userMeta = await this._callMaster('getUserMeta', { userId });
        if (!userMeta) return null;

        return this._callShard(userMeta.esaId, 'getUser', { userId });
    }

    async getUsersByRole(role) {
        // This needs to aggregate from all shards
        return this._callMaster('getUsersByRole', { role });
    }

    async getUsersBySchool(schoolId) {
        const schoolMeta = await this._callMaster('getSchoolMeta', { schoolId });
        return this._callShard(schoolMeta.esaId, 'getUsersBySchool', { schoolId });
    }

    async getUsersByESA(esaId) {
        return this._callShard(esaId, 'getUsersByESA', { esaId });
    }

    async updateUser(userId, data) {
        const userMeta = await this._callMaster('getUserMeta', { userId });
        const result = await this._callShard(userMeta.esaId, 'updateUser', { userId, data });

        // Add to pending sync for offline support
        this._pendingSync.push({
            type: 'updateUser',
            userId,
            data,
            timestamp: Date.now()
        });

        return result;
    }

    // ----- School Operations -----

    async getSchool(schoolId) {
        const schoolMeta = await this._callMaster('getSchoolMeta', { schoolId });
        return this._callShard(schoolMeta.esaId, 'getSchool', { schoolId });
    }

    async getSchoolsByESA(esaId) {
        return this._callShard(esaId, 'getSchoolsByESA', { esaId });
    }

    async updateSchool(schoolId, data) {
        const schoolMeta = await this._callMaster('getSchoolMeta', { schoolId });
        return this._callShard(schoolMeta.esaId, 'updateSchool', { schoolId, data });
    }

    // ----- ESA/District Operations -----

    async getESA(esaId) {
        return this._callMaster('getESA', { esaId });
    }

    async getAllESAs() {
        return this._callMaster('getAllESAs');
    }

    // ----- Curriculum Operations -----

    async getSubject(subjectId) {
        return this._callMaster('getSubject', { subjectId });
    }

    async getAllSubjects() {
        return this._callMaster('getAllSubjects');
    }

    async getSubjectUnits(subjectId) {
        return this._callMaster('getSubjectUnits', { subjectId });
    }

    // ----- Role/Permission Operations -----

    async getRoleConfig(roleId) {
        return this._callMaster('getRoleConfig', { roleId });
    }

    async getAllRoles() {
        return this._callMaster('getAllRoles');
    }

    // ----- Group Operations -----

    async getGroup(groupId) {
        const groupMeta = await this._callMaster('getGroupMeta', { groupId });
        return this._callShard(groupMeta.esaId, 'getGroup', { groupId });
    }

    async getGroupsByUser(userId) {
        const userMeta = await this._callMaster('getUserMeta', { userId });
        return this._callShard(userMeta.esaId, 'getGroupsByUser', { userId });
    }

    // ----- Statistics -----

    async getGlobalStats() {
        return this._callMaster('getGlobalStats');
    }

    async getSchoolStats(schoolId) {
        const schoolMeta = await this._callMaster('getSchoolMeta', { schoolId });
        return this._callShard(schoolMeta.esaId, 'getSchoolStats', { schoolId });
    }

    async getESAStats(esaId) {
        return this._callShard(esaId, 'getESAStats', { esaId });
    }

    // ----- Utility -----

    async healthCheck() {
        try {
            const masterHealth = await this._callMaster('healthCheck');
            return {
                status: 'healthy',
                mode: 'appsscript',
                master: masterHealth,
                timestamp: Date.now(),
                pendingSyncCount: this._pendingSync.length
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                mode: 'appsscript',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    async sync() {
        if (this._pendingSync.length === 0) {
            return { synced: true, count: 0 };
        }

        const toSync = [...this._pendingSync];
        this._pendingSync = [];

        try {
            const result = await this._callMaster('batchSync', { operations: toSync });
            console.log(`[AppsScriptDataService] Synced ${toSync.length} operations`);
            return { synced: true, count: toSync.length, result };
        } catch (error) {
            // Put back failed operations
            this._pendingSync = [...toSync, ...this._pendingSync];
            throw error;
        }
    }
}

// ============================================================================
// DATA SERVICE FACTORY
// ============================================================================

/**
 * Factory for creating DataService instances
 */
class DataServiceFactory {
    static _instance = null;

    /**
     * Get or create the DataService singleton
     */
    static async getInstance(forceMode = null) {
        const mode = forceMode || DataServiceConfig.mode;

        if (this._instance && this._instance._mode === mode) {
            return this._instance;
        }

        let service;

        switch (mode) {
            case 'local':
                service = new LocalDataService();
                break;
            case 'appsscript':
                service = new AppsScriptDataService();
                break;
            case 'insforge':
                if (typeof InsForgeDataService === 'undefined') {
                    console.warn('[DataServiceFactory] InsForgeDataService not loaded, falling back to local mode');
                    service = new LocalDataService();
                    service._mode = 'local';
                    service._fallbackFrom = 'insforge';
                    break;
                }
                service = new InsForgeDataService(DataServiceConfig.insforge);
                break;
            default:
                throw new Error(`Unknown DataService mode: ${mode}`);
        }

        service._mode = mode;

        try {
            await service.initialize();
        } catch (error) {
            // Hybrid Fallback: if InsForge/AppsScript fails, fallback to local
            if (mode !== 'local') {
                console.warn(`[DataServiceFactory] ${mode} initialization failed, falling back to local mode:`, error.message);
                service = new LocalDataService();
                service._mode = 'local';
                service._fallbackFrom = mode; // Track original intended mode
                await service.initialize();
            } else {
                throw error;
            }
        }

        this._instance = service;
        return service;
    }

    /**
     * Reset the singleton (useful for testing)
     */
    static reset() {
        this._instance = null;
    }

    /**
     * Set configuration
     */
    static configure(config) {
        Object.assign(DataServiceConfig, config);
    }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get the current user from DataService
 */
async function getDataServiceUser(userId) {
    const service = await DataServiceFactory.getInstance();
    return service.getUser(userId);
}

/**
 * Quick access to DataService
 */
async function getDataService() {
    return DataServiceFactory.getInstance();
}

// ============================================================================
// EXPORTS (for module systems)
// ============================================================================

// For ES modules
if (typeof window !== 'undefined') {
    window.DataServiceConfig = DataServiceConfig;
    window.AbstractDataService = AbstractDataService;
    window.LocalDataService = LocalDataService;
    window.AppsScriptDataService = AppsScriptDataService;
    window.DataServiceFactory = DataServiceFactory;
    window.getDataService = getDataService;
    window.getDataServiceUser = getDataServiceUser;
}

// For CommonJS/Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataServiceConfig,
        AbstractDataService,
        LocalDataService,
        AppsScriptDataService,
        DataServiceFactory,
        getDataService,
        getDataServiceUser
    };
}
