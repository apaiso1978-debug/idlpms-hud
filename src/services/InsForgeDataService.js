/**
 * InsForgeDataService - Implementation using InsForge Cloud API
 * ==============================================================
 * Connects to live InsForge instance (Cloud-optimized)
 * URL Pattern: /api/database/records/{tableName}
 * Auth: Bearer token
 */
class InsForgeDataService extends AbstractDataService {
    constructor(config = {}) {
        super();
        this._baseUrl = config.baseUrl || 'https://3tcdq2dd.ap-southeast.insforge.app';
        this._apiKey = config.apiKey || 'ik_e9ac09dcf4f6732689dd5558fe889c0a';
        this._initialized = false;
    }

    async initialize() {
        if (this._initialized) return;

        try {
            // Check health via the cloud admin endpoint or just a simple GET on a core table
            const response = await fetch(`${this._baseUrl}/api/database/tables`, {
                headers: { 'Authorization': `Bearer ${this._apiKey}` }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            console.log('[InsForgeDataService] Connected to InsForge Cloud');
            this._initialized = true;
        } catch (e) {
            console.error('[InsForgeDataService] Initialization failed:', e);
            throw e;
        }
    }

    async _call(table, options = {}) {
        const { method = 'GET', query = '', body = null, single = false } = options;

        // Cloud API Pattern: /api/database/records/{table}
        let url = `${this._baseUrl}/api/database/records/${table}`;

        // Append query params if any
        if (query) {
            url += query.startsWith('?') ? query : `?${query}`;
        }

        const headers = {
            'Authorization': `Bearer ${this._apiKey}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`InsForge Cloud Error: ${err.message || response.statusText}`);
        }

        return await response.json();
    }

    // ----- User Operations -----

    async getUser(userId) {
        try {
            // userId could be email or UUID. 
            // Note: Cloud API query params might differ from PostgREST (eq.)
            // Assuming standard param key=value for simplified cloud API
            const users = await this._call('Users', { query: `email=${userId}` });
            return users.length > 0 ? users[0] : null;
        } catch (e) {
            console.error('[InsForgeDataService] getUser failed:', e);
            return null;
        }
    }

    async getUsersByRole(role) {
        return await this._call('Users', { query: `role=${role}` });
    }

    async getUsersBySchool(schoolId) {
        return await this._call('Users', { query: `schoolId=${schoolId}` });
    }

    async updateUser(userId, data) {
        // Find by email first to get ID for PATCH
        const user = await this.getUser(userId);
        if (!user) throw new Error('User not found');

        const results = await this._call(`Users/${user.id}`, {
            method: 'PATCH',
            body: data
        });
        return results;
    }

    // ----- School Operations -----

    async getSchool(schoolId) {
        try {
            const schools = await this._call('Schools', { query: `id=${schoolId}` });
            return schools.length > 0 ? schools[0] : null;
        } catch (e) {
            return null;
        }
    }

    async getSchoolsByESA(esaId) {
        return await this._call('Schools', { query: `districtId=${esaId}` });
    }

    // ----- Curriculum Operations -----

    async getSubject(subjectId) {
        try {
            const subjects = await this._call('Subjects', { query: `id=${subjectId}` });
            return subjects.length > 0 ? subjects[0] : null;
        } catch (e) {
            return null;
        }
    }

    async getAllSubjects() {
        return await this._call('Subjects');
    }

    async getSubjectUnits(subjectId) {
        return await this._call('LearningUnits', { query: `subjectId=${subjectId}` });
    }

    async healthCheck() {
        return {
            status: this._initialized ? 'healthy' : 'uninitialized',
            mode: 'insforge-cloud',
            timestamp: Date.now()
        };
    }
}

// Export if in module environment, else attach to window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InsForgeDataService };
} else if (typeof window !== 'undefined') {
    window.InsForgeDataService = InsForgeDataService;
}
