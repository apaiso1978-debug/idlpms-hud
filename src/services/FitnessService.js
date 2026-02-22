/**
 * FitnessService — Dual-write wrapper for Physical Fitness Test data
 * ==================================================================
 * Pattern: localStorage (fast) + InsForge Cloud (persistent)
 * Falls back to localStorage if cloud is unavailable.
 *
 * @version 1.0.0
 * Iron Rule: ทุก function ทำงานได้แม้ cloud ขัดข้อง
 */

const FitnessService = {

    // ── Config ──
    STORAGE_KEY: 'fitness_results_v1',
    TABLE_NAME: 'student_fitness_records',
    ACADEMIC_YEAR: 2568,
    SEMESTER: 1,

    // InsForge connection
    _baseUrl: 'https://3tcdq2dd.ap-southeast.insforge.app',
    _apiKey: window.LOCAL_SECRETS?.INSFORGE_API_KEY || '',

    // ══════════════════════════════════════════
    // LOCAL STORAGE (Fast Path)
    // ══════════════════════════════════════════

    getLocalResults() {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}'); }
        catch (e) { return {}; }
    },

    saveLocalResult(studentId, data) {
        const results = this.getLocalResults();
        results[studentId] = {
            ...data,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(results));

        // --- PHASE 9: OUTPUT TO PERSON-FIRST HEALTH_RECORDS SCHEMA ---
        if (typeof IDLPMS_DATA !== 'undefined' && IDLPMS_DATA.healthRecords && IDLPMS_DATA.users[studentId]) {
            const user = IDLPMS_DATA.users[studentId];

            // Look up corresponding Person ID from studentProfile relation if possible, else legacy ID
            let personId = studentId; // fallback

            // Try to resolve person_id from studentProfiles
            if (IDLPMS_DATA.studentProfiles) {
                for (const [profId, profData] of Object.entries(IDLPMS_DATA.studentProfiles)) {
                    // Check if this studentProfile points to the legacy role ID or matches name/etc.
                    // For now, if the person_id mapping exists elsewhere we'd use it.
                    // But in our mock, we just use the ID we know or fallback.
                    // If user object has personLink, use it:
                    if (user.person_id) {
                        personId = user.person_id;
                        break;
                    }
                }
            }

            // Emulate health_record ID structure: H_{studentId}
            const recordId = 'H_' + studentId;
            IDLPMS_DATA.healthRecords[recordId] = {
                ...(IDLPMS_DATA.healthRecords[recordId] || {}),
                person_id: personId,
                record_date: new Date().toISOString().split('T')[0],
                term: `${this.SEMESTER}/${this.ACADEMIC_YEAR}`,
                fitness_scores: {
                    sitReach: data.sitReach,
                    pushUp: data.pushUp,
                    stepUp: data.stepUp
                }
            };
        }

        return results[studentId];
    },

    // ══════════════════════════════════════════
    // INSFORGE CLOUD (Persistent Path)
    // ══════════════════════════════════════════

    async _callCloud(path, options = {}) {
        const { method = 'GET', body = null, query = '' } = options;
        let url = `${this._baseUrl}/api/database/records/${path}`;
        if (query) url += query.startsWith('?') ? query : `?${query}`;

        const fetchOptions = {
            method,
            headers: {
                'Authorization': `Bearer ${this._apiKey}`,
                'Content-Type': 'application/json'
            },
        };
        if (body) fetchOptions.body = JSON.stringify(body);

        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`InsForge Error: ${err.message || response.statusText}`);
        }
        return await response.json();
    },

    /**
     * Save fitness record to cloud
     * @param {string} personId  — InsForge person UUID (or student code)
     * @param {string} schoolId  — school UUID
     * @param {string} classId   — class name e.g. 'ป.2/1'
     * @param {object} data      — { sitReach, pushUp, stepUp }
     * @param {string} recordedBy — teacher UUID
     */
    async saveToCloud(personId, schoolId, classId, data, recordedBy) {
        const body = {
            person_id: personId,
            school_id: schoolId,
            academic_year: this.ACADEMIC_YEAR,
            semester: this.SEMESTER,
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
        };

        return await this._callCloud(this.TABLE_NAME, { method: 'POST', body });
    },

    /**
     * Get all fitness records for a school from cloud
     */
    async getCloudRecords(schoolId, academicYear) {
        const year = academicYear || this.ACADEMIC_YEAR;
        const query = `school_id=${schoolId}&academic_year=${year}`;
        return await this._callCloud(this.TABLE_NAME, { query });
    },

    /**
     * Get fitness records for a specific class from cloud
     */
    async getCloudRecordsByClass(classId, academicYear) {
        const year = academicYear || this.ACADEMIC_YEAR;
        const query = `class_id=${encodeURIComponent(classId)}&academic_year=${year}`;
        return await this._callCloud(this.TABLE_NAME, { query });
    },

    // ══════════════════════════════════════════
    // DUAL-WRITE (Primary Interface)
    // ══════════════════════════════════════════

    /**
     * Save a student's fitness result — dual write to localStorage + cloud
     * @param {string} studentId   — IDLPMS student ID (e.g. 'STU_M_100')
     * @param {object} data        — { sitReach, pushUp, stepUp }
     * @param {object} context     — { classId, recordedBy, schoolId }
     * @returns {object} { local: true, cloud: true|false, error?: string }
     */
    async save(studentId, data, context = {}) {
        const result = { local: false, cloud: false, error: null };

        // 1. Always save locally (fast, reliable)
        try {
            this.saveLocalResult(studentId, {
                sitReach: data.sitReach,
                pushUp: data.pushUp,
                stepUp: data.stepUp,
                recordedBy: context.recordedBy || '',
                classId: context.classId || '',
            });
            result.local = true;
        } catch (e) {
            console.error('[FitnessService] localStorage save failed:', e);
        }

        // 2. Try to save to cloud (async, non-blocking on failure)
        try {
            // Resolve person UUID from IDLPMS_DATA if available
            const personUuid = this._resolvePersonId(studentId);
            const schoolUuid = context.schoolId || 'SCH_MABLUD';

            await this.saveToCloud(
                personUuid,
                schoolUuid,
                context.classId || '',
                data,
                context.recordedBy || ''
            );
            result.cloud = true;
            console.log(`[FitnessService] ✓ Cloud saved: ${studentId}`);
        } catch (e) {
            result.error = e.message;
            console.warn(`[FitnessService] ✗ Cloud save failed for ${studentId}:`, e.message);
        }

        return result;
    },

    /**
     * Get results for a class — try cloud first, fall back to localStorage
     * @param {string} classId — e.g. 'ป.2/1'
     * @returns {object} { source: 'cloud'|'local', data: {} }
     */
    async getClassResults(classId) {
        // Try cloud first
        try {
            const cloudRecords = await this.getCloudRecordsByClass(classId);
            if (cloudRecords && cloudRecords.length > 0) {
                // Convert cloud format to app format
                const data = {};
                cloudRecords.forEach(r => {
                    const stuId = this._resolveStudentId(r.person_id);
                    if (stuId) {
                        data[stuId] = {
                            sitReach: r.sit_reach_cm,
                            pushUp: r.push_up_count,
                            stepUp: r.step_up_count,
                            updatedAt: r.updated_at || r.created_at,
                            recordedBy: r.recorded_by,
                            source: 'cloud',
                        };
                    }
                });
                return { source: 'cloud', data };
            }
        } catch (e) {
            console.warn('[FitnessService] Cloud read failed, falling back to localStorage:', e.message);
        }

        // Fallback: localStorage
        const localResults = this.getLocalResults();
        const filteredData = {};

        if (typeof IDLPMS_DATA !== 'undefined' && IDLPMS_DATA.users) {
            Object.entries(IDLPMS_DATA.users).forEach(([stuId, u]) => {
                if (u.role === 'STUDENT' && u.classId === classId && localResults[stuId]) {
                    filteredData[stuId] = { ...localResults[stuId], source: 'local' };
                }
            });
        }

        return { source: 'local', data: filteredData };
    },

    // ══════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════

    /**
     * Resolve IDLPMS student ID to InsForge person UUID
     * For now: uses citizenId as person lookup key
     * If no UUID mapping, sends the IDLPMS ID as-is
     */
    _resolvePersonId(studentId) {
        // Table uses string columns — send IDLPMS ID directly (e.g. STU_M_069)
        return studentId;
    },

    /**
     * Reverse-resolve: InsForge person_id → IDLPMS student ID
     */
    _resolveStudentId(personUuid) {
        if (typeof IDLPMS_DATA === 'undefined') return null;
        // Search by citizenId or insforgeStudentCode
        for (const [id, u] of Object.entries(IDLPMS_DATA.users)) {
            if (u.citizenId === personUuid || u.insforgeStudentCode === personUuid || id === personUuid) {
                return id;
            }
        }
        return personUuid; // Return as-is if no match
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FitnessService };
} else if (typeof window !== 'undefined') {
    window.FitnessService = FitnessService;
}
