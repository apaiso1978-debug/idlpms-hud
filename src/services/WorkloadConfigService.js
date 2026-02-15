/**
 * WorkloadConfigService — Smart Default + Manual Override
 * ========================================================
 * Universal configuration system for IDLPMS.
 * Every configurable value has:
 *   - mode: "locked" | "auto" | "manual"
 *   - default: system-calculated smart default
 *   - value: actual value in use (= default when auto, user-set when manual)
 *
 * Legal references: กคศ. ว9/2564, ว21/2564
 */
class WorkloadConfigService {
    static STORAGE_KEY = 'IDLPMS_WorkloadConfig_';

    // ─── Workload Role Definitions ──────────────────────────────────
    // Each role maps to a domain (2-4) and a default hours/week
    static WORKLOAD_ROLES = {
        homeroom: { label: 'ครูประจำชั้น', domain: 2, defaultHours: 1 },
        plc_leader: { label: 'ผู้นำ PLC', domain: 2, defaultHours: 1 },
        plc_member: { label: 'สมาชิก PLC', domain: 2, defaultHours: 1 },
        lesson_planning: { label: 'จัดทำแผนการสอน', domain: 2, defaultHours: 1 },
        assessment: { label: 'วัดและประเมินผล', domain: 2, defaultHours: 1 },
        media_dev: { label: 'พัฒนาสื่อการสอน', domain: 2, defaultHours: 1 },
        subject_head: { label: 'หัวหน้ากลุ่มสาระ', domain: 3, defaultHours: 2 },
        grade_head: { label: 'หัวหน้าสายชั้น', domain: 3, defaultHours: 2 },
        dept_head_academic: { label: 'หัวหน้าฝ่ายวิชาการ', domain: 3, defaultHours: 3 },
        dept_head_budget: { label: 'หัวหน้าฝ่ายงบประมาณ', domain: 3, defaultHours: 3 },
        dept_head_personnel: { label: 'หัวหน้าฝ่ายบุคคล', domain: 3, defaultHours: 3 },
        dept_head_general: { label: 'หัวหน้าฝ่ายทั่วไป', domain: 3, defaultHours: 3 },
        qa_officer: { label: 'ประกันคุณภาพ', domain: 3, defaultHours: 1 },
        policy_project: { label: 'โครงการนโยบาย', domain: 4, defaultHours: 1 },
        community_service: { label: 'กิจกรรมจิตอาสา', domain: 4, defaultHours: 1 },
    };

    // ─── Default Config Catalog ─────────────────────────────────────
    static DEFAULT_CONFIG = [
        // Domain 1 — Teaching (Hard Rules)
        { key: 'teaching_min_hours', label: 'ชม.สอนขั้นต่ำ', domain: 1, default: 12, min: 12, max: 12, unit: 'ชม./สัปดาห์', mode: 'locked', lockedBy: 'กคศ.', scope: 'system' },
        { key: 'total_workload_min', label: 'ภาระงานรวมขั้นต่ำ', domain: null, default: 20, min: 20, max: 20, unit: 'ชม./สัปดาห์', mode: 'locked', lockedBy: 'กคศ.', scope: 'system' },
        { key: 'plc_min_yearly', label: 'PLC ขั้นต่ำ/ปี', domain: 2, default: 50, min: 50, max: 50, unit: 'ชม./ปี', mode: 'locked', lockedBy: 'กคศ.', scope: 'system' },

        // Schedule Structure
        { key: 'days_per_week', label: 'จำนวนวัน/สัปดาห์', domain: null, default: 5, min: 5, max: 5, unit: 'วัน', mode: 'locked', lockedBy: 'สพฐ.', scope: 'school' },
        { key: 'periods_per_day', label: 'จำนวนคาบ/วัน', domain: null, default: 8, min: 6, max: 10, unit: 'คาบ', mode: 'auto', lockedBy: null, scope: 'school' },
        { key: 'lunch_period', label: 'คาบพักเที่ยง', domain: null, default: 5, min: 3, max: 7, unit: 'คาบที่', mode: 'auto', lockedBy: null, scope: 'school' },

        // Teacher Workload Defaults (Soft)
        { key: 'max_periods_per_week', label: 'คาบสูงสุด/สัปดาห์', domain: 1, default: 35, min: 20, max: 40, unit: 'คาบ', mode: 'auto', lockedBy: null, scope: 'teacher' },
        { key: 'max_periods_per_day', label: 'คาบสูงสุด/วัน', domain: 1, default: 7, min: 4, max: 8, unit: 'คาบ', mode: 'auto', lockedBy: null, scope: 'teacher' },

        // Domain 2 — Support & Learning (Soft Defaults)
        { key: 'plc_hours_per_week', label: 'ชม. PLC', domain: 2, default: 1, min: 0, max: 5, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },
        { key: 'homeroom_hours', label: 'ชม.ครูประจำชั้น', domain: 2, default: 1, min: 0, max: 3, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },
        { key: 'lesson_planning_hours', label: 'ชม.จัดทำแผนการสอน', domain: 2, default: 1, min: 0, max: 3, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },
        { key: 'assessment_hours', label: 'ชม.วัดและประเมินผล', domain: 2, default: 1, min: 0, max: 3, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },

        // Domain 3 — School Quality (Soft Defaults)
        { key: 'dept_head_hours', label: 'ชม.หัวหน้าฝ่าย', domain: 3, default: 3, min: 0, max: 8, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },
        { key: 'grade_head_hours', label: 'ชม.หัวหน้าสายชั้น', domain: 3, default: 2, min: 0, max: 5, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },
        { key: 'subject_head_hours', label: 'ชม.หัวหน้ากลุ่มสาระ', domain: 3, default: 2, min: 0, max: 5, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },
        { key: 'qa_hours', label: 'ชม.ประกันคุณภาพ', domain: 3, default: 1, min: 0, max: 3, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },

        // Domain 4 — Policy (Soft Defaults)
        { key: 'policy_project_hours', label: 'ชม.โครงการนโยบาย', domain: 4, default: 1, min: 0, max: 5, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },
        { key: 'community_hours', label: 'ชม.กิจกรรมจิตอาสา', domain: 4, default: 1, min: 0, max: 3, unit: 'ชม./สัปดาห์', mode: 'auto', lockedBy: null, scope: 'teacher' },
    ];

    // ═══════════════════════════════════════════════════════════════
    //  PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get the full config for a school, merging defaults with saved overrides
     * @param {string} schoolId
     * @returns {Array<Object>} config items with resolved values
     */
    static getConfig(schoolId) {
        const saved = this._loadSaved(schoolId);
        return this.DEFAULT_CONFIG.map(item => {
            const override = saved[item.key];
            if (!override || item.mode === 'locked') {
                return { ...item, value: item.default };
            }
            return {
                ...item,
                mode: override.mode || item.mode,
                value: override.mode === 'manual' ? override.value : item.default,
            };
        });
    }

    /**
     * Get a single config value (resolved)
     * @param {string} schoolId
     * @param {string} key
     * @returns {number}
     */
    static getConfigValue(schoolId, key) {
        const config = this.getConfig(schoolId);
        const item = config.find(c => c.key === key);
        return item ? item.value : null;
    }

    /**
     * Get a single config item (full object)
     * @param {string} schoolId
     * @param {string} key
     * @returns {Object|null}
     */
    static getConfigItem(schoolId, key) {
        const config = this.getConfig(schoolId);
        return config.find(c => c.key === key) || null;
    }

    /**
     * Toggle config mode for a key (auto ↔ manual). Locked items cannot be changed.
     * @param {string} schoolId
     * @param {string} key
     * @param {'auto'|'manual'} mode
     */
    static setConfigMode(schoolId, key, mode) {
        const def = this.DEFAULT_CONFIG.find(c => c.key === key);
        if (!def || def.mode === 'locked') return false;

        const saved = this._loadSaved(schoolId);
        if (!saved[key]) saved[key] = {};
        saved[key].mode = mode;
        if (mode === 'auto') {
            delete saved[key].value; // revert to default
        }
        this._savePersist(schoolId, saved);
        return true;
    }

    /**
     * Set manual value for a config key
     * @param {string} schoolId
     * @param {string} key
     * @param {number} value
     */
    static setConfigValue(schoolId, key, value) {
        const def = this.DEFAULT_CONFIG.find(c => c.key === key);
        if (!def || def.mode === 'locked') return false;

        const clamped = Math.max(def.min, Math.min(def.max, value));
        const saved = this._loadSaved(schoolId);
        if (!saved[key]) saved[key] = {};
        saved[key].mode = 'manual';
        saved[key].value = clamped;
        this._savePersist(schoolId, saved);
        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    //  WORKLOAD CALCULATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Calculate total workload for a teacher.
     * @param {string} schoolId
     * @param {Object} teacher - teacher object with workloadRoles[]
     * @param {number} teachingHours - actual teaching hours from schedule
     * @returns {Object} { domain1, domain2, domain3, domain4, total, status }
     */
    static calculateWorkload(schoolId, teacher, teachingHours) {
        const config = this.getConfig(schoolId);
        const roles = teacher.workloadRoles || [];
        const hasHomeroom = !!teacher.homeroomClass;

        // Domain 1: Teaching hours (from schedule grid)
        const domain1 = teachingHours;

        // Domain 2: Support & Learning
        let domain2 = 0;
        const plcHours = this._val(config, 'plc_hours_per_week');
        domain2 += plcHours; // Everyone does PLC
        if (hasHomeroom || roles.includes('homeroom')) {
            domain2 += this._val(config, 'homeroom_hours');
        }
        domain2 += this._val(config, 'lesson_planning_hours');
        domain2 += this._val(config, 'assessment_hours');

        // Domain 3: School Quality
        let domain3 = 0;
        const d3Roles = ['dept_head_academic', 'dept_head_budget', 'dept_head_personnel', 'dept_head_general'];
        if (roles.some(r => d3Roles.includes(r))) {
            domain3 += this._val(config, 'dept_head_hours');
        }
        if (roles.includes('grade_head')) {
            domain3 += this._val(config, 'grade_head_hours');
        }
        if (roles.includes('subject_head')) {
            domain3 += this._val(config, 'subject_head_hours');
        }
        if (roles.includes('qa_officer')) {
            domain3 += this._val(config, 'qa_hours');
        }

        // Domain 4: Policy
        let domain4 = 0;
        if (roles.includes('policy_project')) {
            domain4 += this._val(config, 'policy_project_hours');
        }
        if (roles.includes('community_service')) {
            domain4 += this._val(config, 'community_hours');
        }

        const total = domain1 + domain2 + domain3 + domain4;

        // Compliance check
        const minTeaching = this._val(config, 'teaching_min_hours');
        const minTotal = this._val(config, 'total_workload_min');
        let status = 'compliant'; // 🟢
        if (domain1 < minTeaching) {
            status = 'critical'; // 🔴
        } else if (total < minTotal) {
            status = 'warning'; // 🟡
        }

        return {
            teacherName: teacher.name || teacher.fullName,
            domain1, domain2, domain3, domain4,
            total,
            minTeaching,
            minTotal,
            status,
            roles,
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════

    static _val(config, key) {
        const item = config.find(c => c.key === key);
        return item ? item.value : 0;
    }

    static _loadSaved(schoolId) {
        try {
            return JSON.parse(localStorage.getItem(`${this.STORAGE_KEY}${schoolId}`) || '{}');
        } catch { return {}; }
    }

    static _savePersist(schoolId, data) {
        localStorage.setItem(`${this.STORAGE_KEY}${schoolId}`, JSON.stringify(data));
    }
}

window.WorkloadConfigService = WorkloadConfigService;
