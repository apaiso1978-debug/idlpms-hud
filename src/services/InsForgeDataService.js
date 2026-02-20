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

    /**
     * Helper to safely map legacy mock string IDs (like TEA_WORACHAI) 
     * to a valid Postgres UUID during the transition phase.
     */
    _mapToUUID(id) {
        if (!id) return id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(id)) return id;
        // Fallback valid UUID for mock IDs (the only one currently in testing DB)
        return '29a7f9c9-bf7f-412c-9110-e73bc209e5d9';
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

    // ----- Person-First Operations (Unity Schema v1.0) -----

    async getPerson(personId) {
        try {
            // personId can be ID Number or UUID
            const query = personId.includes('-') ? `id=${personId}` : `id_number=${personId}`;
            const persons = await this._call('persons', { query });
            return persons.length > 0 ? persons[0] : null;
        } catch (e) {
            console.error('[InsForgeDataService] getPerson failed:', e);
            return null;
        }
    }

    async getPersonWithRoles(personId) {
        try {
            const person = await this.getPerson(personId);
            if (!person) return null;

            const roles = await this._call('role_profiles', { query: `person_id=${person.id}&is_active=true` });
            return { ...person, roles };
        } catch (e) {
            return null;
        }
    }

    async createPerson(personData, creatorId) {
        return await this._call('persons', {
            method: 'POST',
            body: { ...personData, created_by: creatorId }
        });
    }

    async updatePerson(personId, data) {
        return await this._call(`persons/${personId}`, {
            method: 'PATCH',
            body: data
        });
    }

    // ----- Role Profile Operations (Tab 2 Source) -----

    async getActiveRole(personId, schoolId) {
        const query = `person_id=${personId}&school_id=${schoolId}&is_active=true`;
        const profiles = await this._call('role_profiles', { query });
        return profiles.length > 0 ? profiles[0] : null;
    }

    async updateRoleData(profileId, extendedData, updaterId) {
        return await this._call(`role_profiles/${profileId}`, {
            method: 'PATCH',
            body: { extended_data: extended_data, updated_at: new Date().toISOString() }
        });
    }

    // ----- Organization & Hierarchy Operations -----

    async getOrganization(orgId) {
        const orgs = await this._call('organizations', { query: `id=${orgId}` });
        return orgs.length > 0 ? orgs[0] : null;
    }

    async getOrgHierarchy(parentId) {
        return await this._call('organizations', { query: `parent_id=${parentId}` });
    }

    async getGroups(orgId, type = 'CLASS') {
        const query = `org_id=${orgId}&group_type=${type}&is_active=true`;
        return await this._call('groups', { query });
    }

    // ----- Compatibility Layer (Deprecating Users/Schools) -----

    async getUser(userId) {
        console.warn('[InsForgeDataService] getUser is deprecated. Use getPerson.');
        return await this.getPerson(userId);
    }

    async getSchool(schoolId) {
        console.warn('[InsForgeDataService] getSchool is deprecated. Use getOrganization.');
        return await this.getOrganization(schoolId);
    }

    // ----- Phase 4: Work Passport & Intelligence DNA (Tab 4) -----

    async getIntelligenceHistory(personId, days = 30) {
        // Fetch last 30 days of snapshots
        const query = `person_id=${personId}&order=timestamp.desc&limit=100`;
        return await this._call('intelligence_snapshots', { query });
    }

    async addIntelligenceSnapshot(personId, kpaed, creatorId, source = {}) {
        const body = {
            person_id: personId,
            axis_k: kpaed.k || 0,
            axis_p: kpaed.p || 0,
            axis_a: kpaed.a || 0,
            axis_e: kpaed.e || 0,
            axis_d: kpaed.d || 0,
            source_type: source.type || 'direct',
            source_id: source.id || null,
            description: source.description || '',
            created_by: creatorId,
            timestamp: new Date().toISOString()
        };
        return await this._call('intelligence_snapshots', { method: 'POST', body });
    }

    async getWorkPassport(personId) {
        try {
            const [credentials, history] = await Promise.all([
                this._call('person_credentials', { query: `person_id=${personId}` }),
                this.getIntelligenceHistory(personId, 7) // Last 7 days for quick summary
            ]);

            return {
                credentials,
                dna_summary: history.length > 0 ? history[0] : null, // Latest snapshot
                dna_history: history
            };
        } catch (e) {
            console.error('[InsForgeDataService] getWorkPassport failed:', e);
            return null;
        }
    }

    async addCredential(personId, credentialData, creatorId) {
        return await this._call('person_credentials', {
            method: 'POST',
            body: { ...credentialData, person_id: personId, created_by: creatorId }
        });
    }

    // ----- Phase 6: Delegated Administrative Authority (DMDP) -----

    async getDelegations(personId, schoolId) {
        const query = `delegatee_id=${personId}&school_id=${schoolId}&is_active=true`;
        return await this._call('role_delegations', { query });
    }

    async getSchoolDelegations(schoolId) {
        const query = `school_id=${schoolId}&is_active=true`;
        return await this._call('role_delegations', { query });
    }

    async addDelegation(delegatorId, delegateeId, schoolId, capabilityKey, note = '') {
        return await this._call('role_delegations', {
            method: 'POST',
            body: {
                delegator_id: this._mapToUUID(delegatorId),
                delegatee_id: this._mapToUUID(delegateeId),
                school_id: this._mapToUUID(schoolId),
                capability_key: capabilityKey,
                assignment_note: note,
                is_active: true
            }
        });
    }

    async removeDelegation(delegationId) {
        return await this._call(`role_delegations/${delegationId}`, {
            method: 'PATCH',
            body: { is_active: false, updated_at: new Date().toISOString() }
        });
    }

    // ----- Delegation Panel v3.0 Support -----

    /**
     * Get all users (persons with role_profiles) for a school.
     * Used by DelegationPanel to populate teacher dropdown.
     */
    async getUsersBySchool(schoolId) {
        try {
            const query = `school_id=${this._mapToUUID(schoolId)}`;
            const profiles = await this._call('role_profiles', { query });
            // Map to uniform format expected by DelegationPanel
            return (profiles || []).map(p => ({
                id: p.person_id,
                personId: p.person_id,
                fullName: p.full_name || p.person_id,
                role: (p.role_type || '').toUpperCase(),
                homeroomClass: p.homeroom_class || '',
                schoolId: p.school_id
            }));
        } catch (e) {
            console.warn('[InsForgeDataService] getUsersBySchool failed:', e.message);
            throw e;
        }
    }

    /**
     * Get delegations created by a specific director.
     * DISPATCHED view in DelegationPanel.
     */
    async getDelegationsByDirector(directorId, schoolId) {
        const query = `delegator_id=${this._mapToUUID(directorId)}&school_id=${this._mapToUUID(schoolId)}&is_active=true`;
        return await this._call('role_delegations', { query });
    }

    /**
     * Get delegations assigned to a specific person.
     * INBOX view in DelegationPanel.
     */
    async getInboxDelegations(personId) {
        const query = `delegatee_id=${this._mapToUUID(personId)}&is_active=true`;
        return await this._call('role_delegations', { query });
    }

    // ----- Phase 7: Physical Fitness Test Records -----

    async saveFitnessRecord(personId, schoolId, classId, data, recordedBy) {
        return await this._call('student_fitness_records', {
            method: 'POST',
            body: {
                person_id: personId,
                school_id: schoolId,
                academic_year: data.academicYear || 2568,
                semester: data.semester || 1,
                record_date: new Date().toISOString().split('T')[0],
                class_id: classId,
                sit_reach_cm: Number(data.sitReach) || 0,
                push_up_count: Number(data.pushUp) || 0,
                step_up_count: Number(data.stepUp) || 0,
                sit_reach_level: data.sitReachLevel || '',
                push_up_level: data.pushUpLevel || '',
                step_up_level: data.stepUpLevel || '',
                overall_level: data.overallLevel || '',
                recorded_by: recordedBy,
                notes: data.notes || '',
            }
        });
    }

    async getFitnessRecords(schoolId, academicYear = 2568) {
        const query = `school_id=${schoolId}&academic_year=${academicYear}`;
        return await this._call('student_fitness_records', { query });
    }

    async getFitnessRecordsByClass(classId, academicYear = 2568) {
        const query = `class_id=${encodeURIComponent(classId)}&academic_year=${academicYear}`;
        return await this._call('student_fitness_records', { query });
    }

    async healthCheck() {
        return {
            status: this._initialized ? 'healthy' : 'uninitialized',
            mode: 'insforge-cloud',
            schema: 'master-unity-v1.2',
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
